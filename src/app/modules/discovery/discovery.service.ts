import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';

import { Client } from '../../common/services/api/client';
import { Storage } from '../../common/services/storage';

export class DiscoveryService {

  emitter : EventEmitter<any> = new EventEmitter();

  entities : Array<any> = [];
  offset : string = "";
  limit : number = 15;
  inProgress : boolean = false;

  filter : string = "featured";
  type : string = "object/image";
  category : string = "all";

  constructor(private client : Client, private storage : Storage){
    if(this.storage.get('saved.discovery.filter'))
      this.filter = <string>this.storage.get('saved.discovery.filter');
    if(this.storage.get('saved.discovery.type'))
      this.type = <string>this.storage.get('saved.discovery.type');
  }

  setFilter(filter : string){
    this.filter = filter;
    this.storage.set('saved.discovery.filter', filter);
  }

  setType(type : string){
    this.type = type;
    this.storage.set('saved.discovery.type', type);
  }

  setCategory(category : string){
    this.category = category;
    if(this.category == 'all'){
      this.get(true);
      return;
    }

    this.client.get('api/v1/categories/featured/' + this.type, {
        categories: this.category,
        limit: this.limit,
        offset: this.offset
      })
      .then((response : any) => {

        this.entities = [];

        for(let entity of response.entities){
          this.entities.push(entity);
        }

        this.emitter.next(this.entities);
        this.inProgress = false;
        this.offset = response['load-next'];
      });
  }

  search(q : string){
    if(!q){
      return this.get(true);
    }
    this.client.get('api/v1/search/suggest', {
        q: q,
        //type: this.type,
        limit: 12,
        offset: ""
      })
      .then((response : any) => {
        //if(!response.entities || response.entities.length == 0){
        //  this.inProgress = false;
        //  return;
        //}
        this.entities = response.suggestions;

        /*for(let suggestion of response.suggestions){
          this.entities.push({
            guid: suggestion.payload.guid,
            username: suggestion.payload.username,
            name: '@' + suggestion.payload.name,
            icontime: Date.now()
          });
        }*/
        this.emitter.next(this.entities);
        this.offset = response['load-next'];
        this.inProgress = false;
      });
  }

  get(refresh : boolean = false){
    if(refresh)
      this.offset = "";

    return new Promise((res, reject) => {
      this.client.get('api/v1/entities/' + this.filter + '/' + this.type, { limit: this.limit, offset: this.offset})
        .then((response : any) => {

          if(refresh)
            this.entities = [];

          for(let entity of response.entities){
            this.entities.push(entity);
          }

          this.emitter.next(this.entities);
          this.inProgress = false;
          this.offset = response['load-next'];
          res();
        });
    });
  }

  static _(client : Client, storage : Storage){
    return new DiscoveryService(client, storage);
  }

}
