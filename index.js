import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';

// Some test data
let source = "This is a markdown with a superscript x<sup>2</sup> and some more text and some more<sup>3</sup>";
let source2 = "This is a markdown with a superscript x^2^ and some more text and some more^3^";

// Step 1: Replace ^...^ with <sup>...</sup>
const processedMarkdown = source2.replace(/\^([^^]+)\^/g, '<sup>$1</sup>');

async function customNodeRenderer(node, processedMarkdown) {
  console.log('Unsupported node', node);

  if (node.value.includes('<sup>')) {

    // Get the text between <sup> and </sup>
    // This assume the length of the text between <sup> and </sup> is 1
    // To do ... make it dynamic
    let supText = processedMarkdown.substring(node.position.end.offset , node.position.end.offset + 1);
    console.log('supText:', supText);
    return   {
      "nodeType": "text",
      "value": supText,
      "marks": [
          {
              "type": "superscript"
          }
      ],
      "data": {}
  }
  }
  if (node.value.includes('</sup>')) {
    console.log('Ignore and remove the closing </sup> tag.');
    return null;
  }
}

async function removeDuplicateTextNode(richText) {
  // Traverse the content array to find and remove the duplicate text node
  richText.content = richText.content.map((paragraph) => {
    if (paragraph.nodeType === 'paragraph') {
      paragraph.content = paragraph.content.filter((node, index, nodes) => {
        // Check if the current node is a text node with the same value as the previous node
        if (
          node.nodeType === 'text' &&
          index > 0 &&
          nodes[index - 1].nodeType === 'text' &&
          nodes[index - 1].value === node.value
        ) {
          return false; // Remove the duplicate node
        }
        return true; // Keep the node
      });
    }
    return paragraph;
  });

  return richText;
}

async function main() {

  const processedMarkdown = source.replace(/\^([^^]+)\^/g, '<sup>$1</sup>');
  
  // Create renderer with access to processedMarkdown
  const renderer = (node) => customNodeRenderer(node, processedMarkdown);
  
  const document = await richTextFromMarkdown(
    processedMarkdown,
    renderer
  );

//console.log('--------------- The returned document ---------------');
//console.log(JSON.stringify(document, null, 2));
// This is the document that is returned from the richTextFromMarkdown function
// It will contain duplicates text nodes the repeat the superscript text as a child of the text node
// Step 3: Remove the duplicate text nodes with removeDuplicateTextNod()
//console.log('--------------- End of the document ---------------');

const final_document = await removeDuplicateTextNode(document);

console.log('--------------- The final document ---------------');
  console.log(JSON.stringify(final_document, null, 2));
console.log('--------------- End of the final document ---------------');

}

main(); 
