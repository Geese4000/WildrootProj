import { Component } from '@angular/core';
import { WildShapeList } from './wild-shape-list/wild-shape-list';

// Root component: the Data screen is the whole Angular app
@Component({
  selector: 'app-root',
  imports: [WildShapeList],
  template: '<app-wild-shape-list />'
})
export class App {}