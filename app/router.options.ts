const routes = [{ name: "main", path: "/main", component: import("~/pages/index.vue") }];

const refineRoutes = routes.map((route) => {
	return {
		...route,
		component: () => route.component.then((r) => r.default || r),
	};
});

const redirects = [];

import type { RouterConfig } from "@nuxt/schema";

export default <RouterConfig>{
	// https://router.vuejs.org/api/interfaces/routeroptions.html#routes
	routes: (_routes) => [..._routes, ...refineRoutes, ...redirects],

	// https://v3.router.vuejs.org/kr/guide/advanced/scroll-behavior.html
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return savedPosition;
		} else if (to.hash) {
			const element = document.querySelector(to.hash);
			if (element) {
				return { selector: to.hash };
			}
		}
		return { x: 0, y: 0 };
	},
};
