Superscript customNodeRenderer

repo: contenful-superscript-customNodeRenderer

Works for <sup>1</sup> and ^1^ markers

Works for multiple tags in source markdown

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
