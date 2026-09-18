const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { findPost } = require('../article-seo.js');
const posts = require('../posts.json');

test('previously indexed article URLs resolve to their current content', () => {
  const cases = [
    ['life-transition-coaching-navigating-the-internal-shift-with-transitional-intelligence', 'life-transitions-counseling-navigating-the-internal-shift-with-transitional-intelligence'],
    ['do-i-need-therapy-understanding-how-counseling-can-help-with-anxiety-depression-burnout', 'do-i-need-therapy-understanding-how-counseling-can-help-with-anxiety-depression-stress-burnout']
  ];
  for (const [oldID, newID] of cases) assert.equal(findPost(posts, oldID).id, newID);
  for (const post of posts) assert.equal(findPost(posts, post.id), post);
  assert.equal(findPost(posts, 'missing-article'), undefined);
});

test('an exact article ID takes precedence over a legacy alias', () => {
  assert.equal(findPost([{ id: 'other', aliases: ['article'] }, { id: 'article' }], 'article').id, 'article');
});

test('CMS title edits retain the published ID; new posts get a slug', () => {
  const cms = fs.readFileSync(require.resolve('../cms.js'), 'utf8');
  const declaration = cms.match(/const slug = isEditing[\s\S]*?;/)[0];
  const result = (values) => vm.runInNewContext(`${declaration}\nslug`, values);
  assert.equal(result({ isEditing: true, postToEdit: { id: 'published-link' }, title: 'A New Title' }), 'published-link');
  assert.equal(result({ isEditing: false, postToEdit: null, title: 'A New Title!' }), 'a-new-title');
});
