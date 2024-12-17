<template>
  <div id="popup">
    <h1>
      PARB<span class="gradient-o">O</span>T info
    </h1>
    <p v-if="loading">Loading...</p>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="websiteInfo">
      <p v-if="websiteInfo.id"><strong>Id:</strong> {{ websiteInfo.id }}</p>
      <p v-if="websiteInfo.name"><strong>Company:</strong> {{ websiteInfo.name }}</p>
      <p v-if="websiteInfo.website">
        <strong>Website:</strong> 🌐
        <a :href="websiteInfo.website" target="_blank">Visit</a>
      </p>
      <p v-if="websiteInfo.airtable_url">
        <strong>Airtable URL:</strong> 🌐
        <a :href="websiteInfo.airtable_url" target="_blank">Visit</a>
      </p>
      <p v-if="websiteInfo.dealroom_url">
        <strong>Dealroom URL:</strong> 🌐
        <a :href="websiteInfo.dealroom_url" target="_blank">Visit</a>
      </p>
      <p v-if="websiteInfo.year_founded"><strong>Year Founded:</strong> {{ websiteInfo.year_founded }}</p>
      <p v-if="websiteInfo.number_of_employees">
        <strong>Headcount:</strong> {{ websiteInfo.number_of_employees }}
      </p>
      <p v-if="websiteInfo.headcount_one_year_growth">
        <strong>Headcount 1 Year Growth:</strong> {{ websiteInfo.headcount_one_year_growth }}%
      </p>
      <p v-if="websiteInfo.headcount_six_months_growth">
        <strong>Headcount 6 Months Growth:</strong> {{ websiteInfo.headcount_six_months_growth }}%
      </p>
      <p v-if="websiteInfo.headcount_three_months_growth">
        <strong>Headcount 3 Months Growth:</strong> {{ websiteInfo.headcount_three_months_growth }}%
      </p>
      <p v-if="websiteInfo.linkedin_url">
        <strong>Linkedin URL:</strong> 🌐
        <a :href="websiteInfo.linkedin_url" target="_blank">Visit</a>
      </p>
      <p v-if="websiteInfo.last_round_stage">
        <strong>Last Round Stage:</strong> {{ websiteInfo.last_round_stage }}
      </p>
      <p v-if="websiteInfo.total_amount_raised">
        <strong>Total Amount Raised:</strong> {{ websiteInfo.total_amount_raised.toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) }}
      </p>
      <p v-if="websiteInfo.industry"><strong>Industry:</strong> {{ websiteInfo.industry }}</p>
      <p v-if="websiteInfo.last_round_amount">
        <strong>Last Round Amount:</strong> {{ websiteInfo.last_round_amount.toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }) }}
      </p>
      <p v-if="websiteInfo.last_round_date">
        <strong>Last Round Date:</strong> {{ websiteInfo.last_round_date }}
      </p>
      <p v-if="websiteInfo.investors"><strong>Investors:</strong> {{ websiteInfo.investors }}</p>
    </div>




<!--    <pre>-->
<!--      {{ response }}-->
<!--    </pre>-->
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
      response: null,
    };
  },
  methods: {
    fetchWebsiteInfo() {
      this.loading = true;
      this.error = null;
      this.websiteInfo = null;
      this.response = null;

      // Get the active tab's URL
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];
        const url = currentTab.url;
        console.log(`chrome.tabs.query url`, url);

        chrome.runtime.sendMessage(
            {type: 'GET_WEBSITE_INFO', website: url},
            (response) => {
              if (chrome.runtime.lastError) {
                console.error("chrome.runtime.lastError:", chrome.runtime.lastError.message);
                debugger;
                return;
              }
              console.log("YOLOOOOOO");
              debugger;
              this.loading = false;
              console.log("chrome.runtime.sendMessage response", response);
              this.response = response;

              if (response.success) {
                debugger;
                this.websiteInfo = response.data;
              } else if (response.status === 404) {
                debugger;
                this.error = 'Company not found.';
                console.error(response.error);
              } else {
                debugger;
                this.error = 'Unhandled error please contact the Parbot responsible.';
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
