import { Component } from '@angular/core';

import { AddPage } from '../add/add';
import { YourPage } from '../your/your';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = AddPage;
  tab3Root = YourPage;

  constructor() {

  }

}
