# Customer Meeting 5

## Next week

- Deliverables\*\* (Here is what we've done and stuff)
- Put agenda in the slide so he would know what is coming up
- **Put the journey from last meeting to this meeting**
- What have we done and where we will be

## About the algorithm

- There are a couple of areas that maybe a problem
- They want this to be a generalized application so us classifying elements in amazon.com would take away that requirement.
- When we see a button or a text area they are usually a same component
- So if we try to find all elements that has the class "smth_button" we wont get a lot of benefit out of that. The class are usually very specific and they came from a design system so they will be consistent.
- What we should try is compare 2 elements regardless of what they are. That way we will get more benefit from it
- It's hard to select an element but say we select a flyout and compare it to a flyout on another page / select a table and compare it to a table on another page. That would be MARVELLOUS OH MY GOSHHHH
- But how are we going to select the element. Because we can hover above it and inspect it or whatever but we are going to need a DOM tree and at that point we're losing the user friendliness
- Like if we do inspect element and try to go up to the top of the tree to get the element we want. It would be kind of out of scope. This will not be a good use of our time.
- If we do have time to doing a UI comparison would be good.
- Basically we are talking about comparing component vs comparing pattern and this apply pattern
- So the way we are going to see this is if we go to a drop down and it does not look right we can compare it to another drop down and see "Oh the padding is different". There are other ways of doing it but Adam think this this better than going through all the component and compare ALLLL of them together
- If we decide to do comparing all of them it will not work unless we have some manual steps which will take time. So if we want to do that we will have to limit it and do just 2 component or something. And although that sounds appealing, there will still be some technical element of how we select the component which we could limit it by just the selector and use parser or whatever to define the element then after that we can do the inspection.
- But the other problem we will have is the component are not ONE thing, it is a collection of things. Assume there are two buttons that looks the exact same. But one follow the design system and another one is fucking weird, how are we going to compare that?
- So our plan is a "nice to have" rather than the main thing. If we manage to overcome the limitation. So if at the end we have time we can do it.

## About seasonal changes

- The colors and stuff will still be in the amazon color palette so it will not be inconsistent
- The icon and everything is in the palette too
- Just whatever it's up to us
