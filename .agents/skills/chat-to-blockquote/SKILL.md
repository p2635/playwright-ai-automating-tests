---
name: chat-to-blockquote
description: Exports the current AI conversation to a markdown file, wrapped entirely in a markdown blockquote, verbatim, for embedding in blog posts and articles. Use this whenever the user asks to export, save, quote, or turn a conversation into a blockquote for a blog post, article, or documentation, even if they don't use the word "skill."
---

# Chat to Blockquote Export

Exports a full AI conversation as a blockquoted markdown file, for pasting into an already-markdown blog post as a reference or citation.

## Step 1: Ask about collapsibility and reasoning steps, before generating anything

Before producing any output, ask the user:

> "Do you want the blockquote wrapped in a collapsible section, so readers can expand it to see the full conversation, or should the whole conversation always be visible?"

Also ask:

> "Some AI tools show collapsed intermediate reasoning steps alongside their visible replies. Do you want those included in the export, or only what's visible in the chat by default?"

Wait for their answer to both questions before moving on. These decisions change the structure and content of the output, so they must come first, not be added afterwards.

If the user asks for reasoning steps to be included but that content isn't available to you (for example, it wasn't part of what was shared with you, or the platform doesn't expose it), tell them so plainly rather than fabricating or approximating it, and proceed with only what's actually available.

## Step 2: Assemble the conversation, verbatim

Take every message in the conversation, in order, and format it as:

```
**User:** <message text, unmodified>

**Assistant:** <message text, unmodified>
```

Rules:
- Do not summarize, shorten, paraphrase, reorder, or drop any message, including short ones like "thanks" or "ok."
- Preserve original formatting inside each message: code blocks, lists, bold, links, line breaks.
- If a message already contains a fenced code block (```), keep it fenced and intact for now — it gets prefixed along with everything else in Step 3.
- Use the actual model name in place of "Assistant" if known (e.g. "Claude," "GPT-4o").
- If the user asked to include reasoning steps in Step 1, add them right before the visible reply they belong to, clearly labelled, for example:

```
**Assistant (reasoning):** <reasoning text, unmodified>

**Assistant:** <visible reply, unmodified>
```

If the user asked to exclude reasoning steps, or none are available, leave this label out entirely and include only the visible reply.
- Exclude the trailing exchange where the user invokes this skill, and everything after it — for example, the request to export or turn the conversation into a blockquote, the Step 1 collapsibility question, and the user's answer to it. This part of the conversation is about producing the export, not part of the substantive conversation, and adds no value to the record. Stop the transcript at the last message that belongs to the conversation itself, before the export request began.

## Step 3: Neutralize markdown headings inside the transcript

A heading inside the conversation (a line starting with `#`, `##`, `###`, etc.) will render as a real heading once placed inside the blockquote, at the same visual level as headings in the surrounding blog post. This causes two problems: it looks strange nested inside a quote, and it can confuse the blog post's own heading structure or table of contents.

Escape every heading marker so the text stays intact but no longer triggers heading rendering:

```
# Some heading      becomes      \# Some heading
## Sub heading       becomes      \## Sub heading
```

Rules:
- Only escape `#` characters that appear as heading syntax at the very start of a line (after optional leading spaces). Do not touch `#` characters that appear mid-sentence, in code, or in URLs — those are not headings and must stay untouched.
- Do this before Step 4, since adding the `> ` prefix will otherwise combine with the `#` and still register as a heading in some renderers.
- This is a syntax-level change only. The visible text of the heading itself must remain unchanged and fully present — only its markdown heading behavior is disabled.

## Step 4: Wrap the entire transcript in one blockquote

Prefix **every line** of the Step 2 output with `> `, including:
- Blank lines between turns (a bare `>` on its own line, not an empty line)
- Lines inside nested code fences from the original messages
- Lines inside any nested blockquote from the original messages

This is the step most likely to go wrong: a nested code block that isn't prefixed on every line will visually "escape" the blockquote in most renderers. Check nested content specifically, not just the outer lines.

## Step 5: If the user chose collapsible, wrap it in a details block

```markdown
<details>
<summary>Conversation with [model name] (click to expand)</summary>

> **User:** ...
>
> **Assistant:** ...

</details>
```

Requirements for this to render correctly:
- Leave a blank line after `<summary>...</summary>` and before `</details>` — several markdown engines need it to resume parsing markdown inside the HTML block.
- If the target blog uses kramdown (Jekyll's default), add `markdown="1"` to the `<details>` tag: `<details markdown="1">`. GitHub's renderer does not need this. If you don't know the target engine, ask, or include the attribute anyway since it's harmless where it isn't needed.
- Optionally add one or two lines above the `<details>` block summarizing the exchange, so readers get the gist without expanding.

## Step 6: Output the result

Try to save the result as a downloadable `.md` file.

If file write access isn't available in the current environment, output the entire result as a single markdown code block in the chat window instead, so the user can copy it directly. Tell the user which of the two happened.

## Step 7: Verify, and report the verification explicitly

After producing the output, check it against the structural requirements below and report the result to the user — do not just assert it worked without checking.

**Check A — full blockquote wrapping:** Scan every line of the generated output (including inside the `<details>` block, if used). Every line that is part of the transcript must start with `>`. List any line number that fails this, if any.

**Check B — verbatim, no information loss:** Compare the number of user/assistant turns in the output against the number of turns in the original conversation, minus the trailing skill-invocation exchange excluded per Step 2. Spot-check that message content matches word-for-word, not a paraphrase. Report a pass/fail, not just "looks good."

**Check C — no live headings:** Scan the output for any line where `> #` (one or more `#`) is followed by a space, at the start of the quoted content — this is a heading that escaped Step 3. Every original heading marker should instead read `> \#`. List any line number that fails this, if any.

Report all three checks to the user as a short pass/fail summary, for example:

> ✅ Blockquote check: all 42 lines prefixed with `>`.
> ✅ Verbatim check: 6 of 6 turns present, content matches.
> ✅ Heading check: 2 headings found in the original conversation, both escaped correctly.

If either check fails, fix the output and re-run the check before presenting the file.
