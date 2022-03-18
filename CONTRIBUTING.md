# Contributing to the project

The following is a set of guidelines for contributing to this project. It gives an overview of the branching strategy and gives a step-by-step guide on how to contribute

## Branching strategy
All development is done on the `staging` branch. This branch should always have the latest additions, and be fully functional (i.e. have no bugs).

The project follows the feature branching approach: for each new feature or bug fix a new branch should be created, where all the development concerning that feature is done. Then it is merged back into staging, and deleted.

## How to contribute
1. Create a new issue related to the feature to add or bug to fix. Give it a descriptive title, and write in the description what is the aim and the expected result. For example, #96: Clear previous output before new comparison.
2. Create a new branch with `staging` as source. **It is important that the source is `staging` and NOT `master`**. In this case: `96-clear-previous-output-before-new-comparison`.
3. Create a merge request associated to that branch. The source branch should be the new branch associated with the issue (`96-clear-previous-output...`), and the target branch should be `staging`. **It is important to merge into `staging` and NOT `master`**. For example, !42: Resolve "Clear previous output before new comparison".
4. Once the development is done, mark the merge request as ready and assign a reviewer. The reviewer may leave feedback to work on before merging the branch.
5. The reviewer approves the merge request, fixes any merge conflicts, and merges the branch into `staging`.

NOTE: steps (2) and (3) can be done directly through the GitLab UI. Click the button "Create merge request and branch".

## Merging into master
Once the objectives for a release are done, `staging` is merged into `master`. The extension is ready for release. However, this is out of the scope of regular contribution. For new features and bug fixes, refer to the guide above.
