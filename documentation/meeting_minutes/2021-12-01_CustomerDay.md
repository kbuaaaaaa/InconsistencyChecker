# Customer Day 2

(Customer meeting 6)

- Question for the tool parameters: do you want to be able to configure the template?

  - Xinming's approach needs a template (some standards/rules) to work, this template will have set values for the UI elements.
  - Would it be good to let the user modify the template? For instance, instead of checking against font of size 11 (which would be the value in the template), the user will change it to size 10.

- Standards have to be **reusable**

  - How do we make them scalable for every page in the Amazon family?

- When comparing against the inconsitencies, we have to know which elements to check

  - If we have a certain type of button (i.e. the log-in button) we don't want to compare it with every other button in the page -> this will obviously flag them as inconsistent.

- What we can do:

  - For _buttons_ we can create a class to get the structure, the wrong buttons will be flagged as inconsistent, but that will not be a problem.
  - For _borders_ we can check **only if** there is a border to check, we then compare the border rules against the selected border
    - This would mean that if something is meant to have a border but does not, we would not be able to catch it

- When we build the template we have to take into account _persistent_ elements i.e. headers/footers

  - Some elements in the header will change depending on the user's actions i.e. the "log in" button becomes "my account"

- Templates should be **shared**

  - If the process of creating a template takes time (this might be the case), we want to store them for future users so that they do not have to go over creating a template every single time they want to use the tool.

- **Profiles**

  - Useful for slight differences like the log-in/my account button
  - Also useful for seasonal changes

- Creating the templates will be the hardest part

## Questions

About the output of the tool:

- We presented 2 possibilities: giving the user a text report summarising all the inconsistencies or sticking to Xinming's approach and simply highlighting them
- Another approach: giving the text report with clickable text, and when clicking in a certain inconsitency e.g. font, only inconsistencies related to it will be highlighted
  - This will make it easier to identify _why_ an element is inconsistent, instead of just highlighting any inconsistency
  - Reduces the visual disruption
