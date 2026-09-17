# BuggyBoard Test Automation — AI-Assisted Playwright Practice

**Philip Wong** | 🚧 In progress

This repo tracks my hands-on work testing **BuggyBoard**, a bug-tracker web app, using Playwright and AI-assisted test automation techniques (AI-powered test generation, self-healing scripts, predictive test selection, CI/CD integration). My active work is on the [`coursework`](../../tree/coursework) branch.

It started as a fork of the LinkedIn Learning course [_Playwright with AI: Agents, Context, and Test Automation Patterns_][lil-course-url] by Andrew Knight — credit to him and LinkedIn Learning for the original project scaffold and curriculum. I'm still working through it, so expect this README and the codebase to keep evolving as I go.

## What I'm practising

- Building reliable end-to-end Playwright tests across browsers and environments.
- Writing AI-enhanced, self-healing test scripts that adapt to UI changes.
- Generating and refining test cases from natural-language prompts.
- Integrating Playwright into CI/CD pipelines for continuous testing.

## Overview

**BuggyBoard** is the web app under test. This repository contains its source code as well as the Playwright test code I've written and adapted while working through the course material.

### BuggyBoard Web App

**BuggyBoard** is a small web app for tracking bug reports. It is:

- full-stack Node.js
- written in TypeScript
- with a React frontend
- and an Express backend
- and a SQLite database

### Project Structure

```text
backend/         Express + TypeScript API, SQLite data
frontend/        React + TypeScript UI (Vite, Tailwind)
tests/           Playwright test specs (AI generated and human-reviewed)
tests-vibed/     Playwright test specs (AI generated)
specs/           Specification docs (product, design, engineering, features)
playwright.config.ts   Playwright test runner config
SETUP.md         Local setup instructions
```

### Course Branch Structure

This repo also retains the original course's example-code branches (`start`, `main`, `CHAPTER#_MOVIE#`) for reference. See [`SETUP.md`](SETUP.md) for details on how those work and how to resolve branch-switching git errors.

## Course Credit

Original course by Andrew Knight (The Automation Panda), available on [LinkedIn Learning][lil-course-url].

[lil-course-url]: https://www.linkedin.com/learning/playwright-with-ai-agents-context-and-test-automation-patterns
