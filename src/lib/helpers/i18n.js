import { browser } from '$app/environment';
import { init, register, getLocaleFromNavigator } from 'svelte-i18n';
import { localConfig } from '$lib/helpers/dataAPI/api-localstorage';

const supportedLocales = ['zh-CN'];
const itemLocales = ['zh-CN'];

const checkLocale = () => {
	const savedLocale = browser ? localConfig.get('locale') : null;
	const browserLocale = savedLocale || getLocaleFromNavigator();
	const usedLocale = supportedLocales.find((langID) => langID.includes(browserLocale));
	return usedLocale || 'zh-CN';
};

const mountLocale = () => {
	supportedLocales.forEach((langID) => {
		register(langID, () => import(`../../locales/${langID}.json`));
	});

	itemLocales.forEach((langID) => {
		register(langID, () => import(`../../locales/items/${langID}.json`));
	});

	const usedLocale = checkLocale();
	init({
		fallbackLocale: 'zh-CN',
		initialLocale: usedLocale
	});
};

export { mountLocale, checkLocale };
