# Chia Farm Monitor

Monitor chia farm status

## Install

	npm i chia-farm-monitor

## Example

```javascript

const Monitor = require('chia-farm-monitor');

const chia = '/path/to/chia';
const mon = new Monitor(chia, {interval: 5000, errorBackOffFactor: 2});

mon.on('farmError', (msg, summary) => {
	console.log('Farm error', msg);
	// summary might be undefined depending on the error
	console.log('Summary', summary);
});

mon.on('farmRestored', (summary) => {
	console.log('Farm has recovered from previous error', summary);
});

mon.on('farmOk', (summary) => {
	console.log('Farm ok', summary);
});

mon.on('error', (err) => console.log('something crapped out', err));

mon.start();

```
