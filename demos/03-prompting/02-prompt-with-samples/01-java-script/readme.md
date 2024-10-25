# JavaScript - Prompt with samples

```prompt
// Pass in user ids and retrieve user data from jsonplaceholder.typicode.com API, then return it as a JSON object
```

```javascript
async function getUserData(userId) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
    const data = await response.json();
    return data;
}
```
```prompt
Map through an array of arrays of objects
Example: Extract names from the data array
Desired outcome: ['John', 'Jane', 'Bob']
```

```javascript
const data = [
[{ name: 'John', age: 25 }, { name: 'Jane', age: 30 }],
[{ name: 'Bob', age: 40 }]
];
const mappedData = data.flatMap(sublist => sublist.map(person => person.name));
console.log(mappedData);
```