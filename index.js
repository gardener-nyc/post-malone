const DEFAULT_OPTIONS = {
	selector: '#post-malone',
	timeout: 10000,
};

const PostMalone = function (optionOverrides = {}) {
	const options = {
		...DEFAULT_OPTIONS,
		...optionOverrides,
	};

	//
	// === Validate options ===
	//
	const {el, selector, timeout} = options;

	if (el || !selector) {
		throw new Error('An el or selector needs to be passed as an option.');
	}

	//
	// === Actions ===
	//
	const getIframe = () => {
		if (el) {
			return el;
		}

		if (selector) {
			return document.querySelector(selector);
		}
	};

	const getOneTimeEventPromise = eventName =>
		new Promise((resolve, reject) => {
			let isResolved = false;

			const listenerCallback = event => {
				isResolved = true;
				window.removeEventListener(eventName, listenerCallback);

				resolve(event);
			};

			// Listen for event then kill listener
			window.addEventListener(eventName, listenerCallback);

			// Kill listener with default timeout
			setTimeout(() => {
				if (isResolved) return;

				window.removeEventListener(eventName, listenerCallback);
				reject(new Error(`${eventName} timed out`));
			}, timeout);
		});

	const sendEvent = (sendEventName, listenEventName, data = {}) => {
		const iframe = getIframe();

		if (!sendEventName || !listenEventName) {
			throw new Error(
				'First two params are required for send and listen events',
			);
		}

		if (!iframe) {
			throw new Error('No iframe found');
		}

		const listenEventPromise = getOneTimeEventPromise(listenEventName);

		iframe.contentWindow.postMessage(
			JSON.stringify({
				name: sendEventName,
				params: data,
			}),
			'*',
		);

		return listenEventPromise;
	};

	return {
		getCurrentFrame: getIframe,
		send: sendEvent,
		listen: getOneTimeEventPromise,
	};
};

module.exports = PostMalone;
