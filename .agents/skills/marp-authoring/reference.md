# Marp Reference

## Minimal Deck

```markdown
---
marp: true
theme: default
paginate: true
---

# Presentation Title

Short subtitle or context
```

## Parent Category Transition

```markdown
<!-- header: "" -->

# フロントエンドからブロックチェーンまでのデータの流れ

---
```

## Child Category Slide

```markdown
<!-- header: フロントエンドからブロックチェーンまでのデータの流れ -->

## Wallet Connect

- Connect the wallet
- Confirm the active account
- Explain what signs the transaction
```

## Tailwind Two-Column Layout

```markdown
<!-- header: Architecture -->

## Data Flow

<div class="grid grid-cols-2 gap-8 items-start">
  <div>
    <h3 class="text-lg font-semibold mb-3">Client</h3>
    <ul class="space-y-2">
      <li>Collect input</li>
      <li>Build instruction params</li>
      <li>Request signature</li>
    </ul>
  </div>
  <div>
    <h3 class="text-lg font-semibold mb-3">Chain</h3>
    <ul class="space-y-2">
      <li>Receive signed transaction</li>
      <li>Execute program logic</li>
      <li>Update account state</li>
    </ul>
  </div>
</div>

- Add one blank line before returning to Markdown after HTML blocks.
```

## Image Placement

```markdown
## Architecture Overview

![w:900 alt text here](./images/architecture-overview.png)
```

```markdown
<!-- _class: lead -->
![bg right:40% contain](./images/validator-flow.png)

# Validator Flow

- Keep the explanation on the text side
- Use descriptive alt text and filenames
```

## Custom CSS

```markdown
<style>
section {
  background: linear-gradient(to right, #f6d365 0%, #fda085 100%);
}

.custom-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
</style>
```

## Slide-Specific Directives

```markdown
<!-- _backgroundColor: #123456 -->
<!-- _class: lead -->

# Slide Title

Content with special formatting
```
