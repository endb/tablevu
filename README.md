# tablevu (alpha version)
Simple javasript table for vuejs 3.x (Doesn't work with vuejs 2.x)

* No Dependencies

* Working with javascript array or server side (odata or default request)

* Sorting

* Filtering

* Custom column rendering

* ...


## Install
```shell
npm install tablevu
```


## Documentation (Preparing..)
* **data**		: Array or Server side parameters

* **search**		: Reactive filter value

* **rowid**		: Key value for row.

* **class**		: Table class name. (default "table")

* **buttonclass**	: Arrow buttons class name (default "btn")

* **onRowClick**	: Row click event

* **onRowDblClick**	: Row double click event

* **columns**
  * **name**	  	: Column name
  
  * **label**	  	: Column label
  
  * **searchable** 	: Column is searchable (default true)
  
  * **orderable**	: Column is orderable (default true)
  
  * **width**	  	: Column width
  
  * **align**	  	: Column align
  
  * **type**	  	: Data type (datetime, date, time, numeric). Show local value
  
  * **render**  	: Render value


## Samples (Preparing..)

* odata sample (Preparing..)
* search sample (Preparing..)


**odata sample**

```code
<template>
  <tablevu :data="grid" rowid="OrderId" />
</template>

<script>
import { tablevu, odata } from 'tablevu'

export default {
  name: 'App',
  components: {
    tablevu
  },
  setup() {
    const prm = {
      url: `https://services.odata.org/V3/Northwind/Northwind.svc/Orders?$format=json`,
      header: { 'Content-Type': 'application/json;odata=verbose' },
      select: ['OrderID', 'OrderDate', 'ShipName', 'ShipAddress'],
      expand: [
      ]
    };

    const grid = {
      adapter: (grd) => {
        return odata(prm, grd);
      },
      pageSize: 10,
      columns: [
        { name: 'OrderID', label: 'id', width: '26rem' },
        { name: 'OrderDate', label: 'name', width: '26rem' },
        { name: 'ShipName', label: 'name', width: '26rem' },
        { name: 'ShipAddress', label: 'name', width: '26rem' },
      ]
    }

    return { grid }
  }
}
</script>
```

## Dev. Dependencies

- [Vuejs](https://github.com/vuejs/vue) 3.0+


## Browser Support

Modern browsers.


## Authors
endb

## License
tablevu is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
