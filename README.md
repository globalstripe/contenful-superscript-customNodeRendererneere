Superscript customNodeRenderer

repo: contenful-superscript-customNodeRenderer

Works for <sup>1</sup> and ^1^ markers

Works for multiple tags in source markdown

The issue we are encountering is due to the way the @contentful/rich-text-from-markdown library processes the <sup> tag in  markdown. It seems to be creating an extra text node with the same value, which is not the desired behavior.

To fix this, you can post-process the output to remove the duplicate text node. Here's how you can do it:

Step-by-Step Solution:

Convert Markdown to Rich Text: First, convert your markdown to Contentful's Rich Text format using the @contentful/rich-text-from-markdown library.

Post-process the Rich Text Output: After converting, you can traverse the resulting JSON structure and remove the duplicate text node.

Here’s an example of how you can achieve this:

The code inside the customNodeRenderer() function needs to be able to access the source markdown to extract the text value

Create renderer with access to processedMarkdown as follows:

```javascript
const renderer = (node) => customNodeRenderer(node, processedMarkdown);
```

Then use render as the callback:

```javascript
const document = await richTextFromMarkdown(
    processedMarkdown,
    renderer
);
```

To allow the markdown to be passed in

Because of the way the @contentful/rich-text-from-markdown works it will duplicate the superscripted text as regular text too.

This fixes duplication of the superscripted characters with a post processor that finds duplicates on the output document.
The post processor compares the superscripted object with the object and removes the text version if the values match.

Credit to DeepSeek for that :-) I did write the prompt though!

--------------- The final document ---------------
```json
{
  "nodeType": "document",
  "data": {},
  "content": [
    {
      "nodeType": "paragraph",
      "content": [
        {
          "nodeType": "text",
          "value": "This is a markdown with a superscript x",
          "marks": [],
          "data": {}
        },
        {
          "nodeType": "text",
          "value": "2",
          "marks": [
            {
              "type": "superscript"
            }
          ],
          "data": {}
        },
        {
          "nodeType": "text",
          "value": " and some more text and some more",
          "marks": [],
          "data": {}
        },
        {
          "nodeType": "text",
          "value": "3",
          "marks": [
            {
              "type": "superscript"
            }
          ],
          "data": {}
        }
      ],
      "data": {}
    }
  ]
}
```
--------------- End of the final document ---------------
# contenful-superscript-customNodeRendererneere

As you can see, the duplicate text nodes with the value "2" and "3" have been removed, and the output now correctly represents the superscript in Contentful's Rich Text format.

Notes:
This solution assumes that the duplicate text node always appears immediately after the superscript text node. If your markdown structure is more complex, you may need to adjust the logic accordingly.

Always test the solution with different markdown inputs to ensure it works as expected in all scenarios.

Handling ^2^ in addition to <sup>2</sup>

Yes, you can use a regular expression (regex) to convert the ^ syntax in your markdown into <sup> tags. The ^ character is commonly used in markdown to denote superscripts, and you can replace it with the appropriate HTML tags using regex.

Solution: Use Regex to Replace ^ with <sup> Tags
You can use JavaScript's String.prototype.replace() method with a regex pattern to find all occurrences of ^...^ and replace them with <sup>...</sup>.

```const markdown = "This is a markdown with a superscript x^2^ and some more text and some more^3^.";

// Step 1: Replace ^...^ with <sup>...</sup>
const processedMarkdown = markdown.replace(/\^([^^]+)\^/g, '<sup>$1</sup>');

console.log(processedMarkdown);```

Explanation of the Regex:

/\^([^^]+)\^/g:

\^: Matches the ^ character (escaped because ^ is a special character in regex).

([^^]+): Captures one or more characters that are not ^ (this is the content inside the superscript).

\^: Matches the closing ^ character.

g: Global flag to replace all occurrences in the string.

'<sup>$1</sup>':

$1: Refers to the captured group inside the parentheses ([^^]+).

*** To do:  Handling ^2  where there is no closing ^ character.

We would need to assume there that here is only a single character that requires superscripting.

