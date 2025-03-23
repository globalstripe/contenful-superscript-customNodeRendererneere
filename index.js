import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';

// Some test data
let source = `This is some markdown with a superscript x<sup>1</sup> and some more text and some more<sup>1</sup>
and some more text that uses the hat symbol like this^3^ and then some more that does not have a closing hat character like this^4^ and then some more that 
does not have a closing hat character like this^5^ and some^2 may only have an opening hat character - where only the single character after the hat should be superscripted
And also handle<sup>6 where there is no closing tag.  Again assuming there is only a single character to superscript.`



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

// Fixes a problem where the superscripted text is repeated as a regular text node
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

  // Handle ^1^ where there is a ^ character
  //let processedMarkdown = source.replace(/\^([^^]+)\^/g, '<sup>$1</sup>');
  // Handle ^2^ where there is no closing ^ character

//const regex = /(<sup>(\d+)<\/sup>)|(\^(\d+)\^)|(\^(\d))/g;
const regex = /(<sup>(\d+)<\/sup>)|(\^(\d+)\^)|(\^(\d))|(<sup>(\d))(?!<\/sup>)/g;  // handels <sup> with no closing tag too

/* Regex Breakdown:

(<sup>(\d+)<\/sup>): Matches Type 1 (<sup>1</sup>). It captures the entire <sup> tag and the number inside it.

(\^(\d+)\^): Matches Type 2 (^1^). It captures the entire ^1^ pattern and the number inside it.

(\^(\d)): Matches Type 3 (^1). It captures the ^ followed by a single digit.

Replacement Logic:

If the match is Type 1 (<sup>1</sup>), it returns the match as is.

If the match is Type 2 (^1^), it replaces it with <sup>1</sup>.

If the match is Type 3 (^1), it replaces it with <sup>1</sup>. */



const processedMarkdown = source.replace(regex, (match, p1, p2, p3, p4, p5, p6, p7, p8) => {
  if (p1) {
    // Type 1: Already in <sup> format, return as is
    return p1;
  } else if (p3) {
    // Type 2: Convert ^1^ to <sup>1</sup>
    return `<sup>${p4}</sup>`;
  } else if (p5) {
    // Type 3: Convert ^1 to <sup>1</sup>
    return `<sup>${p6}</sup>`;
  } else if (p7) {
    // Type 4: Convert <sup>1 to <sup>1</sup> - to handle no closing tag
    return `<sup>${p8}</sup>`;
  }
  return match;
});

  console.log('------------------------------------------------------');
  console.log('processedMarkdown:', processedMarkdown);
  console.log('------------------------------------------------------');
  // We should now have a string that is ready to be converted to rich text with no ^ characters

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
