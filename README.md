# Chatbook

**A modified Trialogue/Twine engine specifically for Building, Testing, and Exporting conversations as Minimal HTML5**

![Chatbook logo](dist/Twine2/Chatbook/icon.svg)

Chatbook is a chat-style [Twine](http://twinery.org) Story Fromat based on [Trialogue](https://github.com/phivk/trialogue) and its predecessors. Unlike other Twine sources, Chatbook is optimized for **an external runtime**. That is, while you can use Chatbook for Interactive Fiction, that's not this story format's intent.

✅ You want to use [Twine](http://twinery.org) to author complex branching dialogue <br>
✅ You want a conversation format (think chatbot) <br>
✅ You want simple built-in testing to step through flows and get feedback <br>
✅ You want a minimal output format for an **external runtime**

If "yes", then Chatbook is worth looking into.

🔮 [Example Using ChatbookViewer](http://htmlpreview.github.io/?https://github.com/jakobo/chatbook/blob/master/examples/onboarding.html)) <br>
📦 [Example Using Chatbook](http://htmlpreview.github.io/?https://github.com/jakobo/chatbook/blob/master/examples/onboarding.min.html))

Chatbook comes with two distinct flavors: **An Interactive Output** (ChatbookViewer) for testing and stepping through conversations in a pseudo chat interface based on the Trialogue code, and **A Minimal Output** (Chatbook) for using your Twine output files in other systems. When developing a rich chatbot conversation, you'll use ChatbookViewer. When you're ready to publish, you'll select the Chatbook format and shed all of the HTML/CSS/JavaScript required for the interactive version.

- [Chatbook](#chatbook)
  - [🚀 Setup and Your First "Chat"](#%f0%9f%9a%80-setup-and-your-first-%22chat%22)
    - [Add Chatbook and ChatbookViewer as a Twine Story Formats](#add-chatbook-and-chatbookviewer-as-a-twine-story-formats)
    - [Create your first chat story](#create-your-first-chat-story)
  - [🏷 Chatbook Tags](#%f0%9f%8f%b7-chatbook-tags)
  - [🙈 Comments in Chatbook](#%f0%9f%99%88-comments-in-chatbook)
  - [🗂 Recipies](#%f0%9f%97%82-recipies)
    - ["Special" Comments (Directives)](#%22special%22-comments-directives)
    - [Conditional Branching (cycles, etc)](#conditional-branching-cycles-etc)
    - [Scripting Directives in ChatbookViewer](#scripting-directives-in-chatbookviewer)
  - [⚠️ Why would you use Chatbook over <Insert Twine Format>?](#%e2%9a%a0%ef%b8%8f-why-would-you-use-chatbook-over-insert-twine-format)
  - [Developing on Chatbook](#developing-on-chatbook)
  - [Building for Release](#building-for-release)

## 🚀 Setup and Your First "Chat"

### Add Chatbook and ChatbookViewer as a Twine Story Formats

![add](/docs/add-format.gif)

1. From the Twine menu, select `Formats`
2. Then, select the `Add a New Format` tab
3. Paste `https://cdn.jsdelivr.net/gh/jakobo/chatbook@0.1.0/dist/Twine2/Chatbook/format.js`
4. Click `Add`
5. Then, `https://cdn.jsdelivr.net/gh/jakobo/chatbook@0.1.0/dist/Twine2/ChatbookViewer/format.js`
6. Click `Add`

Once you've done this, you can either select Chatbook or ChatbookViewer (Interactive) as your default format.

### Create your first chat story

![create a chat](/docs/trialogue-create.gif)

1. Create a story in the Twine editor.
2. Edit the start passage to include:
   - Title (e.g. start)
   - Passage text (e.g. "Hi 👋")
   - One or more links (e.g. `[[What's your name?]]`)
   - Speaker tag (e.g. `speaker-bot`). This will display the speaker's name (in this case `bot`) in ChatbotViewer format
3. Edit the newly created passage(s) to include:
   - Passage text (e.g. "My name is Bot")
   - One or more links (e.g. `[[Back to start->start]]`)
   - Speaker tag (e.g. `speaker-bot`)
4. Hit `Play` to test the result (Using ChatbookViewer)

## 🏷 Chatbook Tags

Chatbook is designed to work exclusively with Twine's tag system. That means no code in your conversation nodes. This is important because behind the scenes, many other Twine formats convert Passages containing `<% ... %>` into JavaScript code, defeating the goal of portability.

The following tags are supported by ChatbookViewer. It is assumed that anyone consuming a Chatbook formatted Twine story will also support these tags.

| tag                    | explanation                                                                                                                                                                                                                                                                                                                                                            |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auto`                 | Adding `auto` will automatically advance the conversation to the **first** link discovered in the conversation (using any of the standard `[[link]]`, `[[display -> destination]]` or `[[destination <- display]]` formats). Think of this as having your bot say multiple items, one after another.                                                                   |
| `multiline`            | Adding `multiline` turns one speaker line into many. If you have more of an SMS-style of writing, the `multiline` tag will treat line breaks as new messages from the same speaker.                                                                                                                                                                                    |
| `speaker-*` _(prefix)_ | The `speaker-*` tag describes "who" the message is from. For example, a tag of `speaker-bob` would imply the message should come from `bob`.                                                                                                                                                                                                                           |
| `system`               | Use the `system` tag when you want to tag something as not originating from a speaker. Any output that _would have been generated_ from a `system` node is ignored                                                                                                                                                                                                     |
| `prompt-*` _(prefix)_  | The `prompt-*` tag presents the user with a text box for input, saved to the remainder of the tag. So a tag of `prompt-firstName` implies that you want to prompt the user for text, which you wish to save as `firstName`. Upon answering the prompt, the first `[[link]]` encountered will be followed to continue the conversation, similar to the `auto` behavior. |

## 🙈 Comments in Chatbook

The chatbook story format allows for simple comments. Lines beginning with an octothorpe `#` are removed during the parsing process in ChatbookViewer. These lines are made available in Chatbook should you need to attach meaning to your comments.

If you'd like to place a comment across multiple lines, you can use a triple-octothorpe `###`. Everything until the next `###` will be considered a comment.

The following are all comments in Chatbook:

```
# I'm a comment, because I have a "#" at the start of the line

# It can
# cover
# multiple lines

###
You can also use a triple # to denote a block
and everything is ommitted until the next
triple #
###

###
If you need a literal #, you can escape it with a
backslash like this: \###
###
```

## 🗂 Recipies

Below are some common challenges & solutions to writing Twine scripts in Chatbook format

### "Special" Comments (Directives)

If you look at the [onboarding example](/examples/onboarding.twee), you'll notice many of the comments contain an `@yaml` statement. While `ChatbookViewer` doesn't care about these items (they're comments after all), any other system parsing the Twine file can read these statements out of the comment blocks.

These special comments are called **Directives** and they consist of the comment identifier (`#` or `###`) immediatly followed by `@` and a `word`. These are all Directives:

```
#@yaml

#@party=true

###@sql
INSERT INTO winners (name, time) VALUES ('you', NOW())
###
```

Anyone parsing Chatbook Twine files can assume that the regexes `/^#@([\S]+)(.*)/g` (inline) and `/^###@([\S]+)([\s\S]*?)###/gm` (block) will match and extract the directive and the remainder of the comment.

There is no set definition for directives, as adding a directive to Chatbook would require **every external parser to also support it**. This is also why Chatbook is so light- there's almost no parsing being done of the individual Passages.

For consistency with ChatbookViewer, directives should run when a Passage is parsed, but before any tag behavior (such as `auto` or `speaker-*` are applied) This allows directives to form opinions about the Passage and output during rendering.

### Conditional Branching (cycles, etc)

Since Chatbook does not maintain a concept of state, nor have a way to script items such as cycling or conditional links, you should present **all possible branches** using the `[[link]]` syntax. This will allow you to view all permutations in ChatbookViewer.

You can then select a [Directive](#%22special%22-comments-directives) that controls what links are available at runtime. Below is a hypothetical directive that checks a variable in the system in order to determine what branch should be automatically followed.

```
In ChatbookViewer, I will present this as a list of options. But my runtime engine
may look at the two directives below and determine that we should automatically
advance to labelA or labelB.

#@advance TO labelA IF earlierChoice = "foo"
#@advance TO labelB IF earlierChoice = "foo"

[[labelA -> I am option one]]
[[labelB -> I am option two]]
```

### Scripting Directives in ChatbookViewer

If you absolutely want to handle Directives in ChatbookViewer, you can do so by selecting `Edit Story JavaScript` in Twine, and registering a handler for your directive. For example, this logs all `@yaml` directives' content to the developer tools console.

```
story.directive("@yaml", function(info, rendered, passage, story) {
  console.log("YAML data from " + passage.id);
  console.log("Directive contained: " + info);
  return rendered; // return the original (or altered) output
});
```

Directives are evaluated after the Passage is parsed, but before any tag behaviors are applied.

## ⚠️ Why would you use Chatbook over <Insert Twine Format>?

First off, every Twine format I've worked with is amazing and super thougtful. If your goal is to create interactive fiction, self-contained tutorials, etc, you should just use Trialogue, Harlowe, or Sugarcube. However, if you're using Twine as a conversation editor (and you are more interested in the `tw-passagedata` blocks and the data structure behind Twine) Chatbook may be for you.

- **Zero `story.*` Calls** To be as portable as possible, No template tags may be used. That means your code cannot contain the `<% ... %>` blocks seen in Trialogue/Paloma. These tags are incredibly difficult to parse/lex, because they assume a JavaScript environmemt at runtime. And since you don't know where your Twine file is going to run, you must decouple the programming from the data.
- **Tags drive behavior** Because of that first restriction, we need a way to perform actions within Chatbook. Thankfully, Twine's Tag system is up to the task.
- **Dev Experience** Iterating on Twine templates is hard. A lot of time was spent to make the dev experience as simple as (1) put [tweego](https://www.motoslave.net/tweego/) in your executable path, and (2) type `yarn dev`.
- **Multiple Formats** Chatbook provides two syncrhonized formats from the same repository. Features in the proofing / html5-min version will also show up simultaneously in the Interactive one.

## Developing on Chatbook

1. Acquire [tweego](https://www.motoslave.net/tweego/) and place it in your development path.
2. Check out this repository
3. run `yarn install` to install your dependencies
4. run `yarn dev` to start developing using the twee files in the `examples` folder

- Examples are available under `http://localhost:3000`
- TEST_ChatbookViewer can be installed in Twine from `http://localhost:3001/ChatbookViewer`
- TEST_Chatbook can be installed in Twine from `http://localhost:3001/Chatbook`
- When you are done developing/testing, be sure to remove the TEST_Chatbook / TEST_ChatbookViewer formats. If you forget, just restart the dev server so Twine doesn't complain

For local testing convienence, a `stories` directory exists that is easy to call via `yarn tweego`. The `tweego` command ensures that Chatbook & ChatbookViewer are available in your tweego story format path.

As an example, the onboarding document was converted from Twine to Twee using the command `yarn tweego -d ./stories/onboarding.html -o ./examples/onboarding.twee`

## Building for Release

1. Be current on `master`
2. `yarn install` and `yarn build`
3. Commit all files
4. Tag the release `git tag -a -m "<message>" x.x.x`
5. `git push origin master --tags`
