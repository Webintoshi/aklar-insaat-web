# Bug Fix Workflow

## Phase 1: Bug Analysis
1. Reproduce the bug
2. Identify root cause
3. Assess impact
4. Plan fix strategy

## Phase 2: Implementation
1. Create branch: `fix/[bug-description]`
2. Implement minimal fix
3. Add regression test (if applicable)
4. Verify fix works

## Phase 3: Verification
1. Test edge cases
2. Check related features
3. Ensure no new bugs introduced

## Phase 4: Deploy
1. Code review
2. Merge to main
3. Deploy
4. Monitor

## Severity Levels
- **Critical**: Site down, data loss, security breach
- **High**: Major feature broken, workaround difficult
- **Medium**: Feature partially broken, workaround exists
- **Low**: Minor issue, cosmetic, nice-to-have

## BMAD Commands
```bash
# Start fix
bmad start fix "bug-description"

# Emergency hotfix
bmad hotfix
```
