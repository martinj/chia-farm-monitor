'use strict';

const EventEmitter = require('events');
const chiaFarmSummary = require('chia-farm-summary');

class Monitor extends EventEmitter {

	constructor(chiaExecutable, {interval = 60000, errorBackOffFactor = 5} = {}) {
		super();
		this.chia = chiaExecutable;
		this.originalInterval = interval;
		this.interval = interval;
		this.ref;
		this.running = false;
		this.lastWasError = false;
		this.errorBackOffFactor = errorBackOffFactor;
	}

	start() {
		if (this.running) {
			throw new Error('Monitor is already running');
		}

		this.running = true;
		this.check();
	}

	async check() {
		try {
			const summary = await chiaFarmSummary(this.chia);
			if (!summary.farmingStatus) {
				return this.notOk('No farming status recieved', summary);
			}

			if (summary.farmingStatus !== 'Farming') {
				return this.notOk(`Farm not running, status: ${summary.farmingStatus}`, summary);
			}

			this.isOk(summary);
		} catch (err) {
			this.notOk(`Monitor check failed: ${err.message}`);
		} finally {
			this.scheduleCheck();
		}
	}

	scheduleCheck() {
		if (!this.running) {
			return;
		}

		if (this.lastWasError) {
			this.interval = this.interval * this.errorBackOffFactor;
		} else {
			this.interval = this.originalInterval;
		}

		this.ref = setTimeout(() => this.check(), this.interval);
	}

	stop() {
		clearTimeout(this.ref);
		this.running = false;
		this.interval = this.originalInterval;
		this.lastWasError = false;
	}

	async notOk(msg, summary) {
		this.lastWasError = true;
		this.safeEmit('farmError', msg, summary);
	}

	async isOk(summary) {
		if (this.lastWasError) {
			this.safeEmit('farmRestored', summary);
		}
		this.safeEmit('farmOk', summary);
		this.lastWasError = false;
	}

	safeEmit(event, ...args) {
		try {
			this.emit(event, ...args);
		} catch (err) {
			this.emit('error', err);
		}
	}
}

module.exports = Monitor;
