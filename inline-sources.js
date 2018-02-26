const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');

const linkTypes = {
  html: [{
    type: 'css',
    outerRegExp: /<link.*href="([^"]*)"[^>]*>/gi,
    innerRegExp: /href="([^"]*)"/i,
    prepend: '<style>\n',
    append: '</style>'
  }, {
    type: 'js',
    outerRegExp: /<script.*src="([^"]*)".*<\/script>/gi,
    innerRegExp: /src="([^"]*)"/i,
    prepend: '<script>\n',
    append: '</script>'
  }],
  css: [{
    type: 'css',
    outerRegExp: /@import url\(['"]?([^'"\)]*)['"]?\);?/gi,
    innerRegExp: /url\(['"]?([^'"\)]*)['"]?\)?/i,
    prepend: '',
    append: ''
  }],
  js: []
}

async function getSource(pathStr, type) {
  if (/^https?:\/\//.test(pathStr)) {
    return {
      type,
      text: await axios.get(pathStr).then(response => response.data)
    };
  } else {
    return {
      type,
      text: await fs.readFile(pathStr, 'UTF-8')
    };
  }
}

function getLinks(source) {
  return linkTypes[source.type].map(linkType => ({
    type: linkType.type,
    prepend: linkType.prepend,
    append: linkType.append,
    matches: (source.text.match(linkType.outerRegExp) || []).map(fullMatch => ({
      full: fullMatch,
      url: fullMatch.match(linkType.innerRegExp)[1]
    }))
  }));
}

async function transform(text, links) {
  let linksLeft = links.reduce((acc, type) => acc + type.matches.length, 0);
  if (linksLeft === 0) return text;
  let transformed = text;
  await new Promise(function(resolve, reject) {
    links.forEach(linkType => {
      linkType.matches.forEach(async (match) => {
        const sourceText = await inlineSources(match.url, linkType.type);
        transformed = transformed.replace(match.full, `${linkType.prepend}${sourceText}${linkType.append}`);
        linksLeft--;
        if (linksLeft === 0) resolve();
      });
    });
  });
  return transformed;
}

async function inlineSources(entry, type) {
  const source = await getSource(entry, type);
  const links = getLinks(source);
  const transformed = await transform(source.text, links);
  return transformed;
}

async function run(entry, output) {
  const inlined = await inlineSources(entry, path.extname(entry).slice(1));
  fs.writeFile(output, inlined);
}

module.exports = run;
