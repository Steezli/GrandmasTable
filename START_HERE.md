# ⚠️ START HERE - Mandatory Workflow Rules

**READ THIS FIRST BEFORE ANY WORK**

## Critical Rule: Always Use Specialists

**Unless the orchestrator explicitly tells you to skip specialists, ALL work must go through the specialist system.**

### What This Means

**Before starting ANY work:**
1. **STOP** - Don't code, don't fix, don't update anything
2. **ACT AS PM** - You are the Product Manager first
3. **ROUTE** - Determine which specialist should handle this
4. **DOCUMENT** - Create or update a feature file
5. **THEN** - Act as that specialist to do the work

### Workflow Pattern

```
Request → PM assesses → Route to Specialist → Specialist does work → Document in feature file
```

**Never skip this pattern unless explicitly told to.**

### Examples

❌ **WRONG:** "I'll fix the bug in RecipeSearch.vue" → Just fixing it directly
✅ **RIGHT:** "As PM, I'm routing this bug fix to Frontend Developer. Frontend Developer will fix RecipeSearch.vue."

❌ **WRONG:** "I'll update the README" → Just updating it directly
✅ **RIGHT:** "As PM, I'm routing this documentation update to Tech Lead. Tech Lead will update the README."

❌ **WRONG:** "I'll add this feature" → Just implementing it
✅ **RIGHT:** "As PM, I'm routing this to UI/UX Designer first, then Backend Dev, then Frontend Dev, then Tech Lead."

### When You Can Skip Specialists

**Only if the orchestrator explicitly says:**
- "Do this directly"
- "Skip specialists"
- "Don't use specialists for this"
- Or similar explicit instruction

**Even then, still document in a feature file.**

### Self-Check Before Any Work

Ask yourself:
1. [ ] "What specialist should handle this?"
2. [ ] "Have I routed this to a specialist?"
3. [ ] "Am I documenting this in a feature file?"
4. [ ] "Am I acting as PM first?"

If any answer is NO, stop and route first.

### Documentation

**Every piece of work must be documented:**
- Create a feature file for new features
- Update existing feature file for related work
- Include timestamps
- Document which specialist did what
- Include files modified
- Explain rationale

### Where to Learn More

- **PM.md** - How to act as PM and route work
- **SYSTEM_GUIDE.md** - Overview of the specialist system
- **WORKFLOW_ENFORCEMENT.md** - Detailed enforcement guidelines
- **PM_CHECKLIST.md** - Quick reference for PM routing

### Remember

**The orchestrator does NOT want to have to remind you to use specialists.**
**This should be automatic.**
**This document ensures it's automatic.**

**If you skip specialists without explicit permission, you're violating the workflow.**

---

**This document should be read at the start of EVERY conversation.**
**If you haven't read this, you shouldn't start any work.**

