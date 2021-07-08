'use strict';
const css = require('css');
const {isUtilitySupported} = require('./utils');
const cssToReactNative = require('css-to-react-native').default;

const remToPx = (value, remSize) => `${Number.parseFloat(value) * remSize}px`;

const groupStyles = rules => {
	return rules.reduce((styles, rule) => {
		if (rule.type === 'rule') {
			for (const selector of rule.selectors) {
				const utility = selector.replace(/^\./, '').replace('\\', '');

				if (isUtilitySupported(utility, rule)) {
					let hasRem = false
					const declarations = rule.declarations.filter(({property, value}) => {
						// Skip line-height utilities without units
						if (property === 'line-height') {
							if (!value.endsWith('rem')) {
								return false
							}
						}
						return true
					}).map(({property, value}) => {
						if (!hasRem && value.endsWith('rem')) {
							hasRem = true
						}

						return [property, value];
					});

					if (hasRem) {
						styles.byRem[utility] = declarations
					} else {
						styles.common[utility] = cssToReactNative(declarations)
					}
				}
			}
		}
		return styles
	}, {
		common: {
			underline: {textDecorationLine: 'underline'},
			'line-through': {textDecorationLine: 'line-through'},
			'no-underline': {textDecorationLine: 'none'},
		},
		byRem: {},
	})
}

module.exports = (source, remSizes) => {
	const {stylesheet} = css.parse(source);

	const styles = groupStyles(stylesheet.rules)
	return {
		common: styles.common,
		rems: remSizes.reduce((obj, remSize) => {
			obj[remSize] = Object.entries(styles.byRem).reduce((o, [utility, declarations]) => {
				o[utility] = cssToReactNative(declarations.map(([p, v]) => {
					if (v.endsWith('rem')) {
						v = remToPx(v, remSize)
					}
					return [p, v]
				}))
				return o
			}, {})
			return obj
		}, {})
	}
};
