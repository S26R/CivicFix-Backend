Let’s break it down:

main branch → stays stable, only merged when something is fully tested and ready.

model branch → like a staging ground for backend devs. Everyone merges their feature branches here after review.

model-ankan (your branch) → your personal working branch. You push commits here while building routes, then open a pull request (PR) into model.

That workflow works really well in hackathons because:

No one breaks the main branch accidentally.

Everyone can test features together on the model branch.

You can track who worked on what (through feature branches like model-ankan).

A common naming style some teams use:

feature/signup

feature/login

bugfix/auth-validation

…but your model-ankan naming is perfectly fine if your team understands it.

✨ One extra tip: enable branch protection rules on main (so nobody can push directly without PR/merge). That way, your final demo code is safe.

Do you also want a PR review rule where at least one teammate must approve before merging into model? That makes teamwork smoother.
