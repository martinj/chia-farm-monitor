# Chia Farm Monitor

Monitor chia farm status

## Install

	npm i chia-farm-monitor

## Example

```javascript

const Monitor = require('chia-farm-monitor');

const chia = '/path/to/chia';
const mon = new Monitor(chia, {interval: 5000, errorBackOffFactor: 2});

mon.on('farmError', (msg) => {
	console.log('Farm error', msg);
});

mon.on('farmRestored', () => {
	console.log('Farm has recovered from previous error');
});

mon.on('error', (err) => console.log('something crapped out', err));

mon.start();

```
