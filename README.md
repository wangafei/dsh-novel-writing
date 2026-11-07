# dsh-novel-writing

DeepSeek Harness 的长篇小说写作技能包：把「构思 → 大纲 → 人物 → 思维导图 → 章节 → 连续性」拆成 6 个可调用的技能，每个技能对应 `story/` 下的一组文件。

## 包含的技能

| 技能 | 用途 | 主要产出 |
|---|---|---|
| `novel-premise` | 立意、题材、一句话故事、开篇钩子 | `story/premise.md` |
| `novel-outline` | 全书 / 分卷 / 逐章大纲、节拍与伏笔规划 | `story/outline/` |
| `novel-characters` | 人物卡、关系网、弧光与语言风格 | `story/characters/` |
| `novel-mindmap` | Mermaid 结构图、人物关系图、势力图、时间线 | `story/mindmaps/` |
| `novel-continuity` | 写前 brief、写后更新、跨章一致性巡检 | `story/timeline.md`、`story/foreshadowing.md`、`story/notes/` |
| `novel-drafting` | 章节正文写作与改写，去 AI 腔、控字数、章末钩子 | `drafts/volume-XX/chapter-NNN.md` |

## 安装

在 DeepSeek Harness 的「设置 → 插件 → 安装」中填入：

```
github:wangafei/dsh-novel-writing#v1.0.0
```

或使用完整地址 `git+https://github.com/wangafei/dsh-novel-writing.git#v1.0.0`。安装后 6 个技能会出现在技能列表中。

## 目录结构

```
package.json          DSH bundle 声明（dsh.bundle.patch 指向 cordis.patch.yml）
cordis.patch.yml      向 profile 插入 novel-writing-skills 行
lib/index.js          技能提供者：扫描 assets/*.md，解析 frontmatter 后注册
assets/*.md           每个文件一个技能，YAML frontmatter 含 name / description / whenToUse
```

技能是运行时扫描的：改 `assets/` 里的 Markdown 不需要重装或重启。

## 许可

MIT
