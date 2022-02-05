# Version Control Development Practices

## Introduction

The following are some practices I try to follow when using version control tools, such as git, to optimize my 
workflows, maintain consistency with projects, and be able to rapidly develop and maintain my projects.

## Change Management and Branching

### Best Practices

When implementing a change, whether it be a new feature, a bug fix, a refactor, etc., I always aim to follow the 
following principles:

1. The change should be
   - **ATOMIC:** Very little in terms of the change load being introduced from the current branch
   - **INCREMENTAL:** Similar to atomicity, it should introduce an incremental, logical development to its parent branch
   - **UNDERSTANDABLE:** Easily identifiable in terms of what is being changed, why it is being changed, and how the 
     change differs from its origin (again, this implies both atomicity and incremental)
2. Any loss to backwards compatability is well-documented, and the project is updated according to
[Semantic Versioning](https://semver.org/).
3. A large change, such as a feature or substantial refactor, should be broken up into a subset of smaller changes 
   that reflect the qualities outlined in the first principle.

### Creating and Using Branches

With these principles in mind, I use the following general steps when implementing a change:

1. The change represents a deviation from the current version, or branch, whether it be a change being directly 
   introduced to the `main` branch, or some developmental/feature branch, so it justifies the creation of a new branch.
2. In creating a branch to reflect the change, I use the following naming conventions:
   ```shell
   $ git checkout -b <change-type>/<change-name>
   ```
   Where:
   - `change-type` identifies the type of change; an enumeration of (including, but not limited to):
     - `feature`: For new features being implemented
     - `bugfix`: For bugs being remediated
     - `patch`: Similar to bugfix, patching existing functionality
     - `refactor`: Refactoring existing functionality
     - `task`: A task required to execute a larger change; this could be fixing a bug, adding functionality, etc.
   - `change-name` is a short description for the name of the change, kebab-cased, for example, `add-search-bar`
3. For example, if there were a new change being implemented to add a new footer component to a web application, the 
   flow might look as follows:
    ```shell
    $ git checkout main
    $ git checkout -b feature/add-footer-to-homepage
    ```
   - Let's say that said feature required a couple sub-tasks in order to be introduced. Those would each represent 
     their **own** branch from the feature branch, i.e.:
     ```shell
     $ git checkout -b feature/add-footer-to-homepage
     $ git checkout -b task/create-react-component
     ```
     ```shell
     $ git checkout -b feature/add-footer-to-homepage
     $ git checkout -b refactor/update-router
     ```
     ```shell
     $ git checkout -b feature/add-footer-to-homepage
     $ git checkout -b task/add-unit-tests
     ```
4. Then, while the feature is being implemented, there would be associated branches for the feature and all of its 
   sub-tasks, i.e.:
    ```
    main
      /feature/add-footer-to-homepage
        /task/create-react-component
        /task/add-unit-tests
        /refactor/update-router
    ```
    After development of each child branch is complete, it can be merged back into the feature branch, and the 
   other associated branches can be rebased with the parent, and once all child branches have been merged back in, 
   the feature is ready to be merged back into main.
5. Although this recursive-style flow likely seems trivial and commonplace to most developers, I like to maintain 
   and highlight this practice as it allows me to maintain consistency with change management, as well as manage 
   large-scale projects that have many features/fixes/refactors/etc. being introduced in parallel.


### Rebasing

As highlighted above, this recursive-style of change management means that there are constantly a variety of changes 
being introduced. In order to avoid the hell that is merge conflicts when branches are being introduced due to a 
variety of upstream changes not being present in the current branch, I:

1. Ensure that the local repository is up-to-date with the origin
2. Always rebase the current branch with its parent
3. Rebase **frequently**; aiming to rebase every morning is a solid start

## Commits

In the same vein of change management, committing changes on a regular cadence is crucial for not only ensuring that 
incremental functionality is being added to the current workflow, but also that every change being introduced is 
being saved.

### Best Practices

If a branch can be thought of as an atomic, incremental, and understandable version of its parent, a 
commit can then be thought of as an atomic, incremental, and understandable change being introduced on any given 
branch. With this in mind, I try to follow the following steps/principles when using commits to introduce changes in my 
work:

1. Commit **often**; the diff from one commit to the next should be very minor.
   - This makes the change log for the current branch easy to traverse and understand; allowing me to roll back to a 
     certain commit if needed.
2. Ensure that only the **required** files are checked into version control for the commit
   - It's often too easy for me to get in the practice of using `$ git add .` and throwing up some random test file; 
     the commit should be intentional with its result.
3. Leverage commit messages to describe and outline the change being introduced in the commit (see
[*How to Write a Good Commit Message*](https://cbea.ms/git-commit/)), i.e.:
    ```shell
    $ git add <file-1> <file-2> <...>
    $ git commit -m
    > A helpful subject line for the commit
    >
    > A body outlining the changes introduced in the commit
    > - Change one
    > - Change two
    > - etc.
    ```