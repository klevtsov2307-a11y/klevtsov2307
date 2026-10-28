import {test} from 'node:test';
import assert from 'node:assert/strict';
import {slots,randomChoices,validChoices,makeStory} from '../public/content.js';
test('16 hours with complete selectable story fragments',()=>{assert.equal(slots.length,16);for(const slot of slots){assert.ok(slot[2].length>=4);for(const [title,text]of slot[2]){assert.ok(title.length>3);assert.ok(text.length>100);}}});
test('random days and every selectable option generate complete narratives',()=>{for(let n=0;n<100;n++){const c=randomChoices();assert.ok(validChoices(c));const story=makeStory(c);slots.forEach((s,i)=>assert.ok(story.includes(s[2][c[i]][1])));}for(let i=0;i<16;i++)for(let j=0;j<slots[i][2].length;j++){const c=Array(16).fill(0);c[i]=j;assert.ok(makeStory(c).includes(slots[i][2][j][1]));}});
test('corrupt saved data is rejected',()=>{for(const v of [null,{},[],Array(16).fill(-1),Array(16).fill(9),Array(16).fill('0')]){assert.equal(validChoices(v),false);assert.throws(()=>makeStory(v));}});
