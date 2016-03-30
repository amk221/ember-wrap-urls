import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { text } from 'dummy/utils/samples';
import { helper } from 'ember-helper';
import { htmlSafe } from 'ember-string';
const { escapeExpression } = Ember.Handlebars.Utils;
import Component from 'ember-component';
import WrapUrlsComponent from 'ember-wrap-urls/components/wrap-urls';


moduleForComponent('wrap-urls', 'Integration | Component | wrap urls', {
  integration: true
});



test('it renders', function(assert) {
  assert.expect(2);

  this.render(hbs`{{wrap-urls}}`);

  assert.equal(this.$().html(), '<!---->',
    'renders as a tagless component');

  this.render(hbs`{{#wrap-urls}}foo{{/wrap-urls}}`);

  assert.equal(this.$().html(), '<!---->',
    'no block mode');
});



test('escaping', function(assert) {
  assert.expect(1);

  this.render(hbs`{{wrap-urls text='<script>'}}`);

  assert.equal(this.$().html(), '&lt;script&gt;',
    'text is escaped');
});



test('null text', function(assert) {
  assert.expect(1);

  this.set('text', null);

  this.render(hbs`{{wrap-urls text=text}}`);

  assert.equal(this.$().html(), '<!---->',
    'does not blow up');
});



test('safe strings', function(assert) {
  assert.expect(1);

  this.register('helper:truncate', helper(function(args) {
    let [ string, length ] = args;
    return htmlSafe(escapeExpression(string.slice(0, length)));
  }));

  this.render(hbs`{{wrap-urls text=(truncate 'visit http://example.com' 16)}}`);

  let expecting = 'visit <span class="ember-view url">http://exa</span>';

  assert.equal(this.$().html(), expecting,
    'can handle safe strings');
});



test('it wraps urls', function(assert) {
  assert.expect(1);

  this.set('text', text);

  this.render(hbs`{{wrap-urls text=text}}`);

  let expecting = `
http: <span class="ember-view url">http://foo.com</span>
https: <span class="ember-view url">https://bar.com</span>
ftp: <span class="ember-view url">ftp://baz.com</span>
file: <span class="ember-view url">file://qux.jpg</span>
emoji: 💩 <span class="ember-view url">http://norf.com</span>
subdomain: <span class="ember-view url">http://foo.bar.com</span>
path: <span class="ember-view url">http://foo.com/bar/baz</span>
close: <span class="ember-view url">http://foo.com</span> <span class="ember-view url">https://bar.com</span>
`;

  assert.equal(this.$().html(), expecting,
    'wraps urls with a span');
});



test('it wraps urls as hyperlinks', function(assert) {
  assert.expect(1);

  this.set('text', text);

  this.render(hbs`{{wrap-urls text=text component='wrap-urls/hyperlink'}}`);

  let expecting = `
http: <a href="http://foo.com" class="ember-view hyperlink">http://foo.com</a>
https: <a href="https://bar.com" class="ember-view hyperlink">https://bar.com</a>
ftp: <a href="ftp://baz.com" class="ember-view hyperlink">ftp://baz.com</a>
file: <a href="file://qux.jpg" class="ember-view hyperlink">file://qux.jpg</a>
emoji: 💩 <a href="http://norf.com" class="ember-view hyperlink">http://norf.com</a>
subdomain: <a href="http://foo.bar.com" class="ember-view hyperlink">http://foo.bar.com</a>
path: <a href="http://foo.com/bar/baz" class="ember-view hyperlink">http://foo.com/bar/baz</a>
close: <a href="http://foo.com" class="ember-view hyperlink">http://foo.com</a> <a href="https://bar.com" class="ember-view hyperlink">https://bar.com</a>
`;

  assert.equal(this.$().html(), expecting,
    'replaces urls with hyperlinks');
});



test('custom component', function(assert) {
  assert.expect(1);

  const XFooComponent = Component.extend({
    layout: hbs`{{attrs.url}}`,
    attributeBindings: ['id', 'target']
  });

  this.register('component:x-foo', XFooComponent);

  this.render(hbs`
    {{~wrap-urls
      text='visit http://my http://link'
      component=(component 'x-foo' target="foo")~}}
  `);

  let expecting = 'visit <div target="foo" class="ember-view">http://my</div> <div target="foo" class="ember-view">http://link</div>';

  assert.equal(this.$().html(), expecting,
    'can render each URL using a custom component');
});



test('custom pattern', function(assert) {
  assert.expect(1);

  const originalRegex = WrapUrlsComponent.regex;

  WrapUrlsComponent.reopenClass({
    regex: /mailto:(.*)?/g
  });

  this.render(hbs`{{wrap-urls text='email me mailto:fred@smith.com'}}`);

  let expecting = 'email me <span class="ember-view url">mailto:fred@smith.com</span>';

  assert.equal(this.$().html(), expecting,
    'its possible to customise the URL pattern');

  WrapUrlsComponent.regex = originalRegex;
});



test('re-computing', function(assert) {
  assert.expect(2);

  this.set('text', 'http://foo.com');

  this.render(hbs`{{wrap-urls text=text}}`);

  let expecting = '<span class="ember-view url">http://foo.com</span>';

  assert.equal(this.$().html(), expecting,
    'precondition');

  this.set('text', 'http://bar.com');

  expecting = '<span class="ember-view url">http://bar.com</span>';

  assert.equal(this.$().html(), expecting,
    'updating the text will render updated URLs');
});
