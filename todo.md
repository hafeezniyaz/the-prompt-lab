-add message component as text box fixed at the bottom where user can select the role and type the message which should appendned to the messages list . this will eliminate the need of clicking mesage everytime i need to type a new message. consider this is as an extention not replacement for adding messages to the messages list

-add variable support in system prompt and user prompt by auto detecting {{variable_name_without_name}} pattern
-add variable panel as the 3rd collapsable pannel to the right with variable key value pair 
-user should also be able to add his variables in the variable panel . at execution the {{variable_name_without_space}} if found shuould be replaced with value if found
variables in the variable list should have default value as empty which means variable which are defined withoud value should be replaced by emty string 
-add subtle animation while moving the message from output to message list , should look like message pushed to left panel clearing the output panel, remember the animation should not be averwelming
-enable srolling overflow for output panel
-while scrolling messages list , fix the header of the section along with message button on top of the messages section always