---
name: marp-authoring
description: Marp / Marpit の Markdown スライドを作成・編集する際に、front matter、slide separator、header comment、親カテゴリ遷移スライド、Tailwind utility、画像配置、custom CSS の規約を適用する。Use when the user asks for Marp slides, Marp markdown, presentation deck authoring, or converting content into Marp.
---

# Marp Authoring

Marp に関する旧 Cursor rules のうち、スライド authoring に必要な部分だけを切り出した project-local skill。

## Use When

- Marp / Marpit 形式のスライドを新規作成するとき
- 既存の Markdown 原稿を Marp 用に整形するとき
- Marp の layout, header, 画像配置, custom CSS を調整するとき

## Core Rules

1. 各 deck は基本的に以下の front matter から開始する。

```markdown
---
marp: true
theme: default
paginate: true
---
```

2. スライド区切りは必ず `---` を使う。
3. 親カテゴリが切り替わるときは、そのカテゴリ名だけを見せる専用スライドを挿入して区切りを明確にする。
4. 親カテゴリをラベルとして見せたい slide では、slide title の直前に `<!-- header: Parent Category -->` を置く。
5. 子カテゴリの title は `##` を使う。
6. スライド本文は簡潔に保ち、Markdown 行は常に左寄せのまま書く。
7. `<div>` などの HTML tag を使ったあとは、次の Markdown 本文に戻る前に必ず空行を入れる。
8. 汎用的なレイアウトは Tailwind utility class を優先して組み、不要に複雑な HTML を増やさない。
9. 画像パスは原則 `./images/` 配下を使い、説明的な file name と alt text を付ける。
10. 画像の配置や背景指定は Marpit の画像記法で行い、サイズや位置指定を明示する。
11. custom CSS は deck 全体の見た目やレイアウト強化が必要な場合にだけ追加し、一貫性と可読性を崩さない。
12. `_backgroundColor`, `_class`, split background などの Marp directive は、意図が明確な slide に限定して使う。
13. 見た目より情報伝達を優先し、各 slide は clear and concise に保つ。

## Output Expectations

- 生成する Marp Markdown はそのまま `.md` として保存・render できる形にする。
- header comment, title, body, image syntax の順序を崩さない。
- HTML と Markdown を混在させる場合も、Markdown parser が壊れない空行配置を守る。

## Category Slide Pattern

親カテゴリ切替時は、通常 slide とは分けて title-only slide を入れる。

```markdown
<!-- header: "" -->

# Parent Category Title

---
```

子カテゴリ slide では親カテゴリを `header`、子カテゴリを `##` で表す。

```markdown
<!-- header: Parent Category -->

## Child Category Title
```

## Reference

具体的な Marp 記法例は [reference.md](reference.md) を参照する。
