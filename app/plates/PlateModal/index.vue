<template>
	<ClientOnly>
		<div id="plate--modal" :class="{ '-active': modalStore.isOpen }">
			<TransitionGroup @enter="onEnter" @leave="onLeave" :css="false">
				<template v-for="item in openList" :key="item.uid">
					<template v-if="item.isSystem">
						<ModalSystem :item="item" :style="{ zIndex: item.order }" />
					</template>

					<template v-else-if="item.isSource">
						<ModalSource :item="item" :style="{ zIndex: item.order }" />
					</template>

					<template v-else>
						<ModalCustom :item="item" :style="{ zIndex: item.order }" />
					</template>
				</template>
			</TransitionGroup>
		</div>
	</ClientOnly>
</template>

<script setup>
import { useModalStore } from "@store";
import ModalSystem from "./ModalSystem";
import ModalSource from "./ModalSource";
import ModalCustom from "./ModalCustom";

import getUniques from "./unique/index.js";

const modalStore = useModalStore();

const openList = computed(() => {
	return modalStore.openList.map((item, idx) => {
		const uniqueData = item.isUnique && getUniques(item.type);
		if (uniqueData) {
			const { auth, system, option = {} } = uniqueData;
			const patchs = { uniqueData, ...option };
			if (system) {
				patchs.isSystem = true;
			}
			if (auth) {
				patchs.auth = true;
			}
			item.patch(patchs);
		}
		item.order = idx;
		return item;
	});
});

const onEnter = async (el, done) => {
	await nextTick();
	const uid = el.dataset.uid;
	const item = modalStore.modals[uid];
	if (!item) {
		done();
		return;
	}

	item.patch({ isVisible: true });

	await item.enterMotion(el, item);

	item.onOpenComplete(item);
	item.eventFire("openComplete");
	done();
};

const onLeave = async (el, done) => {
	const uid = el.dataset.uid;
	const item = modalStore.modals[uid];
	if (!item) {
		done();
		return;
	}

	await item.leaveMotion(el, item);

	item.patch({ isVisible: false });
	item.onCloseComplete(item);
	item.eventFire("closeComplete");
	done();
};

onMounted(() => {
	modalStore.$patch((state) => {
		state.isMounted = true;
	});
});
</script>

<style lang="scss" scoped>
#plate--modal {
	position: fixed;
	left: 0;
	top: 0;
	width: var(--window-width);
	width: 100%;
	height: var(--window-height);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	opacity: 0;
	pointer-events: none;
	// transition: opacity 300ms ease;
	box-sizing: border-box;
	opacity: 1;

	&.-active {
		opacity: 1;
		// pointer-events: all;
	}
}
</style>
