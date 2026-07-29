# Money Manager

A simple, local, file-based tracker for work hours, income, spending,
savings, and Roth IRA contributions, plus a running list of financial
goals. There's no database and no external service — everything lives in
plain CSV/Markdown files in this folder so it's easy to read, edit by hand,
or back up.

Ask the **money-manager** agent to log shifts, paychecks, purchases,
deposits, or contributions, and to answer questions like "how much did I
make this week" or "am I on track for my emergency fund goal." It only
records numbers you actually give it — it never estimates tips, balances,
or contribution limits on its own.

## Wages on file

- Sports Center: **$19.00/hour**
- Golf course: **$16.90/hour + tips** (tips are logged per shift, never assumed)

## Files

| File | Contents |
| --- | --- |
| `data/work_hours.csv` | Every shift: date, job, hours, wage, tips, computed gross pay |
| `data/income.csv` | Paychecks and any other income |
| `data/spending.csv` | Purchases and expenses |
| `data/savings.csv` | Deposits, withdrawals, and reported account balances |
| `data/roth_ira.csv` | Roth IRA contributions by tax year |
| `goals.md` | Financial goals and progress notes |

## Example requests

- "I worked 5.5 hours at the golf course today and made $32 in tips"
- "Log my Sports Center paycheck: $412.50"
- "I spent $18 on groceries"
- "Put $50 into savings, new balance is $1,240"
- "I contributed $200 to my Roth IRA for 2026"
- "How much did I earn this week?"
- "Update my goal: save $2,000 for a laptop by December"
