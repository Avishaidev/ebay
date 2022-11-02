import { Component } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import * as _ from 'lodash';

export function noWhitespaceValidator(control: FormControl) {
  const isSpace = control.value && control.value[0] === ' ' && control.value.trim() === '';
  return isSpace ? {'whiteSpace': true} : null;
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  formObj: FormGroup;
  showLoading: boolean;
  data: { word: string, rank: number }[] = [];

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.formObj = this.formBuilder.group({
      searchValue: ['', Validators.compose([Validators.required, noWhitespaceValidator])]
    });
  }

  searchTopic() {
    if (!this.formObj.valid) {
      return;
    }

    this.showLoading = true;
    const searchValue: string = this.formObj.value.searchValue.trim();

    this.http.get(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&titles=${searchValue}&origin=*`)
              .toPromise().then((res) => {

      const pages = _.get(res, 'query.pages', {});

      // Concat all pages
      let value = '';
      Object.keys(pages).forEach(key => {
        const extracts = _.get(pages[key], 'extract', '');

        value += extracts;
      });

      // Remove html tags and spaces
      value = value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const words = value.split(' ');
      const wordCounts: any = {};
      words.forEach(word => {
        word = word.toLowerCase();
        if (!wordCounts[word]) {
          wordCounts[word] = 1;
        } else {
          wordCounts[word]++;
        }
      });

      const wordsArray: {word: string, rank: number}[] = [];

      Object.keys(wordCounts).forEach(word => {
        wordsArray.push({
          word,
          rank: wordCounts[word]
        });
      });

      const sortedArray = _.orderBy(wordsArray, ['rank', 'word'],
        ['desc', 'asc']);

      const data = [sortedArray[0]];

      for (let i = 1; i < sortedArray.length; ++i) {
        if (sortedArray[i].rank < data[data.length - 1].rank) {
          data.push(sortedArray[i]);
        }

        if (data.length === 5) {
          break;
        }
      }

      let maxRank = 5;
      data.forEach(item => {
        item.rank = maxRank--;
      });

      this.data = data;
      this.showLoading = false;
    }, () => {
      this.showLoading = false;
      alert('Error while trying to fetch data from Wiki.');
    });
  }
}

