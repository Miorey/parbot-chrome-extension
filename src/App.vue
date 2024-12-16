<template>
  <div id="popup">
    <h1>
      PARB<span class="gradient-o">O</span>T info
    </h1>
    <p v-if="loading">Loading...</p>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="websiteInfo">
      <p><strong>Name:</strong> {{ websiteInfo.name }}</p>
      <p><strong>Domain:</strong> {{ websiteInfo.domain }}</p>
      <p><strong>Website:</strong> <a :href="websiteInfo.website" target="_blank">{{ websiteInfo.website }}</a></p>
      <p><strong>Airtable ID:</strong> {{ websiteInfo.airtable_id }}</p>
    </div>
    <button @click="fetchWebsiteInfo">Refresh</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      error: null,
      websiteInfo: null,
    };
  },
  methods: {
    fetchWebsiteInfo() {
      this.loading = true;
      this.error = null;
      this.websiteInfo = null;

      // Get the active tab's URL
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];
        const url = currentTab.url;

        chrome.runtime.sendMessage(
            {type: 'GET_WEBSITE_INFO', website: url},
            (response) => {
              this.loading = false;
              if (response.success) {
                this.websiteInfo = response.data;
              } else {
                this.error = 'Failed to fetch website info.';
                console.error(response.error);
              }
            }
        );
      });
    },
  },
  mounted() {
    this.fetchWebsiteInfo();
  },
};
</script>

<style>
h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.gradient-o {
  background: linear-gradient(
      45deg,
      #1294ee,
      #37fff8,
      #84e349,
      #d8f767,
      #fc8a01,
      #fe1a38,
      #fb2647,
      #fd415c
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}
</style>
