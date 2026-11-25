#!/usr/bin/env node
/**
 * GitHub API 推送脚本（沙箱直连 github.com 超时时的备用通道）。
 *
 * 为什么存在：本沙箱直连 github.com:443 超时，git push 不可用，
 * 只能走 api.github.com。但 API 创建 commit 会规范化提交元数据，
 * 且若手工重读工作区文件容易推错版本。本脚本解决这两点：
 *   1. 所有文件内容从 git 对象（ls-tree + cat-file）读取，推的就是已提交的内容；
 *   2. 推送后用枚举法在本地重建同 SHA 的 commit 对象，保证本地与远端一致。
 *
 * 用法：
 *   GH_TOKEN=xxxx node scripts/push-via-api.mjs
 *
 * 安全：token 只从环境变量读取，不写入文件、不打印。
 * 前提：本地 HEAD 比远端领先若干提交；这些提交尚未推送。
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const TOKEN = process.env.GH_TOKEN
if (!TOKEN) {
  console.error('缺少 GH_TOKEN 环境变量')
  process.exit(1)
}

const REPO = 'xiaoyu-hue/qubian'
const API = 'https://api.github.com'
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
}

function git(...args) {
  // core.quotepath=false：避免中文路径被转义成带引号的八进制形式（如 "docs/06-..."）
  return execFileSync('git', ['-c', 'core.quotepath=false', ...args], { cwd: ROOT, encoding: 'utf-8' }).replace(/\n$/, '')
}

async function api(method, path, data) {
  const body = data === undefined ? undefined : JSON.stringify(data)
  let lastErr
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(API + path, { method, headers: HEADERS, body })
      const json = await res.json()
      if (!res.ok) {
        if (res.status >= 400 && res.status < 500) throw new Error(`HTTP ${res.status}: ${JSON.stringify(json).slice(0, 200)}`)
        throw new Error(`HTTP ${res.status}`)
      }
      return json
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, 1500))
    }
  }
  throw lastErr
}

/** 取某个 commit 相对其父提交变更的文件路径 */
function changedFiles(commit) {
  const parent = git('rev-parse', `${commit}^`)
  return git('diff', '--name-only', parent, commit).split('\n').filter(Boolean)
}

/** 从 git 对象取某个 commit 中某文件的内容（base64） */
function blobFromCommit(commit, path) {
  const sha = git('rev-parse', `${commit}:${path}`)
  const raw = execFileSync('git', ['cat-file', 'blob', sha], { cwd: ROOT })
  return { sha, base64: raw.toString('base64') }
}

/** 提交对象里的 author/committer 行信息 */
function actorAndTime(commit) {
  const raw = git('cat-file', 'commit', commit)
  const line = raw.split('\n').find((l) => l.startsWith('author ')) || ''
  const m = line.match(/^author (.+) <(.+)> (\d+) ([+-]\d{4})$/)
  if (!m) throw new Error('无法解析提交作者信息')
  return { name: m[1], email: m[2], timestamp: m[3], tz: m[4] }
}

/** 在本地重建与远端同 SHA 的 commit 对象，并对齐引用 */
function alignLocal(target, tree, parents, msg, actor) {
  const who = `${actor.name} <${actor.email}>`
  for (const tail of ['', '\n', '\n\n']) {
    for (const tz of [actor.tz, '+0000', '+0800']) {
      const header =
        `tree ${tree}\n` +
        parents.map((p) => `parent ${p}\n`).join('') +
        `author ${who} ${actor.timestamp} ${tz}\n` +
        `committer ${who} ${actor.timestamp} ${tz}\n\n`
      const candidate = Buffer.from(header + msg.replace(/\n$/, '') + tail)
      const sha = execFileSync('git', ['hash-object', '-t', 'commit', '--stdin'], { cwd: ROOT, input: candidate, encoding: 'utf-8' }).trim()
      if (sha === target) {
        execFileSync('git', ['hash-object', '-t', 'commit', '-w', '--stdin'], { cwd: ROOT, input: candidate })
        execFileSync('git', ['update-ref', 'refs/heads/main', target], { cwd: ROOT })
        execFileSync('git', ['update-ref', 'refs/remotes/origin/main', target], { cwd: ROOT })
        return true
      }
    }
  }
  return false
}

async function main() {
  const localHead = git('rev-parse', 'HEAD')
  const remoteRef = await api('GET', `/repos/${REPO}/git/ref/heads/main`)
  const remoteHead = remoteRef.object.sha
  console.log(`本地 HEAD: ${localHead}`)
  console.log(`远端 HEAD: ${remoteHead}`)

  if (localHead === remoteHead) {
    console.log('已是最新，无需推送')
    return
  }

  // 找出本地领先远端的提交链（从旧到新）
  const commits = git('rev-list', '--reverse', `${remoteHead}..${localHead}`).split('\n').filter(Boolean)
  console.log(`待推送提交: ${commits.length} 个`)

  let currentRemote = remoteHead
  for (const commit of commits) {
    const parent = git('rev-parse', `${commit}^`)
    const parentCommit = await api('GET', `/repos/${REPO}/git/commits/${currentRemote}`)
    const baseTree = parentCommit.tree.sha

    const entries = []
    for (const path of changedFiles(commit)) {
      const { base64 } = blobFromCommit(commit, path)
      const blob = await api('POST', `/repos/${REPO}/git/blobs`, { content: base64, encoding: 'base64' })
      entries.push({ mode: '100644', type: 'blob', path, sha: blob.sha })
    }

    const tree = await api('POST', `/repos/${REPO}/git/trees`, { base_tree: baseTree, tree: entries })
    const msg = git('log', '-1', '--format=%B', commit)
    const actor = actorAndTime(commit)
    const who = {
      name: actor.name,
      email: actor.email,
      date: new Date(Number(actor.timestamp) * 1000).toISOString().replace('.000Z', 'Z'),
    }
    const created = await api('POST', `/repos/${REPO}/git/commits`, {
      message: msg,
      tree: tree.sha,
      parents: [currentRemote],
      author: who,
      committer: who,
    })

    // 校验 tree 内容一致：本地 commit 的 tree 与 API 重建的 tree 必须相同
    const localTree = git('rev-parse', `${commit}^{tree}`)
    if (tree.sha !== localTree) {
      throw new Error(`提交 ${commit.slice(0, 7)} 的 tree 不一致（本地 ${localTree} / 远端 ${tree.sha}），已停止推送`)
    }

    await api('PATCH', `/repos/${REPO}/git/refs/heads/main`, { sha: created.sha, force: false })
    console.log(`已推送 ${commit.slice(0, 7)} → ${created.sha.slice(0, 7)}`)

    const aligned = alignLocal(created.sha, tree.sha, [currentRemote], msg, actor)
    if (aligned) {
      console.log('  本地已对齐')
    } else {
      console.warn('  警告：本地未对齐（内容一致，仅 SHA 元数据差异）')
    }
    currentRemote = created.sha
  }
  console.log('推送完成')
}

main().catch((e) => {
  console.error('推送失败:', e.message)
  process.exit(1)
})
