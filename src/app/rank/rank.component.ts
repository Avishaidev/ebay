import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.scss']
})
export class RankComponent{
  @Input() rank: number;

  constructor() { }
}
