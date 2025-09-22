# Lab 3 — CI + Unit Tests (Fragments)


## Setup

* `cd Lab3 && npm ci`
* Test env: create users →

  ```bash
  npx htpasswd -cbB tests/.htpasswd user1@email.com password1
  npx htpasswd -bB  tests/.htpasswd user2@email.com password2
  ```
* `env.jest` (committed):

  ```ini
  PORT=8080
  LOG_LEVEL=silent
  HTPASSWD_FILE=tests/.htpasswd
  ```

## Scripts

* `npm run lint` — ESLint (`src/**`, `tests/**`)
* `npm test` — Jest (serial)
* `npm run coverage` — opens `coverage/` report

## CI (GitHub Actions)

* Triggers on changes to `Lab3/**`.
* Jobs: **ESLint** and **Unit Tests** (Node LTS, cached with `Lab3/package-lock.json`).
* Badge (optional): `https://github.com/<you>/CCP555-2025F-NSC-Diba-Makki-144420189/actions/workflows/ci.yml/badge.svg?branch=main`

## Required screenshots

![npm test](https://github.com/user-attachments/assets/dba8f77b-4ff1-4abf-bd73-849f4de2f0a9)
![2-npmRunCoverage](https://github.com/user-attachments/assets/646b3248-bd99-4ebf-b258-6eeb97ebbe29)
![ESlintFailing](https://github.com/user-attachments/assets/d1e7c3e4-7eb6-47a2-9bf3-307b5b0079d2)
![UnitTestFailing](https://github.com/user-attachments/assets/38b7651c-3f58-49cb-ad7b-d40b45fcf548)
![3-ESlintTest](https://github.com/user-attachments/assets/392b1a4f-9ced-400f-b53e-7d18e6d4bad5)
![00-ESLint and Unit Tests](https://github.com/user-attachments/assets/16fdfa4b-0f24-4d26-accb-0cebe68b6f7e)
![Actions](https://github.com/user-attachments/assets/ddd02af9-5371-476e-b562-f23faac2dbda)



## Submit

* Actions link: `.../actions/workflows/ci.yml`
* Upload the 5 screenshots to Blackboard.

> Don’t commit `.env` or `coverage/`. `env.jest` and `tests/.htpasswd` are OK.

