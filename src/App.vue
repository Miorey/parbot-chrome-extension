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
      <p v-if="websiteInfo.country"><strong>Company:</strong> {{ websiteInfo.country }}</p>
      <p v-if="websiteInfo.airtable_url">
        <strong>Airtable URL:</strong> 🌐
        <a :href="websiteInfo.airtable_url" target="_blank">Visit</a>
      </p>
      <p v-if="websiteInfo.dealroom_url">
        <strong>Dealroom URL:</strong> 🌐
        <a :href="websiteInfo.dealroom_url" target="_blank">Visit</a>
      </p>
      <p v-if="websiteInfo.linkedin_url">
        <strong>Linkedin URL:</strong> 🌐
        <a :href="websiteInfo.linkedin_url" target="_blank">Visit</a>
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
      <div>
        <!-- Other website information -->
        <p v-if="websiteInfo.investors_2 && websiteInfo.investors_2.length > 0" class="investors">
          <strong>Investors :</strong>
        </p>
        <investors-tag v-if="websiteInfo.investors_2" :investors="websiteInfo.investors_2" />
      </div>
      <p v-if="websiteInfo.salesforce_partner">
        <strong>Salesforce - Partner:</strong> {{ websiteInfo.salesforce_partner }}
      </p>
      <p v-if="websiteInfo.salesforce_url">
        <strong>Salesforce URL:</strong> 🌐
        <a :href="websiteInfo.salesforce_url" target="_blank">Visit</a>
      </p>
      <p v-if="websiteInfo.salesforce_last_deal_date">
        <strong>Salesforce - Last Deal Date:</strong> {{ websiteInfo.salesforce_last_deal_date }}
      </p>
      <p v-if="websiteInfo.salesforce_last_activity_date">
        <strong>Salesforce - Last Activity Date:</strong> {{ websiteInfo.salesforce_last_activity_date }}
      </p>
    </div>
    <div v-if="showChart" class="chart-container">
      <canvas id="employeesChart"></canvas>
    </div>
<!--    <pre>-->
<!--      {{ response }}-->
<!--      {{ chartData }}-->
<!--      {{ showChart }}-->
<!--    </pre>-->
    <button @click="fetchWebsiteInfo">Refresh</button>
  </div>
</template>

<script>
import {Chart} from 'chart.js/auto';
import InvestorsTag from "./components/InvestorsTag.vue";

/**
 * Calculates the number of employees sometime ago based on the current number of employees
 * and the percentage growth.
 *
 * @param {number} currentEmployees - The current number of employees.
 * @param {number} percentageGrowth - The percentage growth since the earlier time.
 * @returns {number|string} The number of employees sometime ago, or an error message if the calculation is invalid.
 * @throws {Error} If currentEmployees or percentageGrowth are not numbers.
 */
function calculatePastEmployees(currentEmployees, percentageGrowth) {
  if (typeof currentEmployees !== "number" || typeof percentageGrowth !== "number") {
    throw new Error("Both currentEmployees and percentageGrowth must be numbers.");
  }

  const denominator = 1 + percentageGrowth / 100;

  if (denominator === 0) {
    return "Calculation is invalid: percentage growth of -100 leads to division by zero.";
  }

  return currentEmployees / denominator;
}

export default {
  components: {InvestorsTag},
  data() {
    return {
      loading: false,
      error: null,
      websiteInfo: null,
      response: null,
      showChart: false,
      chartData: false,
    };
  },
  methods: {
    fetchWebsiteInfo() {
      this.loading = true;
      this.error = null;
      this.websiteInfo = null;
      this.response = null;
      const _this = this

      // Get the active tab's URL
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const currentTab = tabs[0];
        const url = currentTab.url;

        chrome.runtime.sendMessage(
            {type: 'GET_WEBSITE_INFO', website: url},
            (response) => {
              if (chrome.runtime.lastError) {
                return;
              }
              this.loading = false;
              this.response = response;

              if (response.success) {
                this.websiteInfo = response.data;
                const chartData = _this.prepareHeadcountData(this.websiteInfo)
                if (chartData) {
                  _this.renderChart(chartData)
                  _this.showChart = true
                } else {
                  _this.showChart = false
                }
              } else if (response.status === 404) {
                this.error = 'Company not found.';
              } else {
                this.error = 'Unhandled error please contact the Parbot responsible.';
              }
            }
        );
      });
    },
    /**
     * Prepares headcount data for rendering a chart.
     *
     * This function calculates past employee counts based on the current employee count
     * and the growth percentages for specific time periods. If the current employee count
     * ("Now") is null, it skips the calculations and returns null.
     *
     * @param {Object} websiteInfo - The information object containing employee counts and growth data.
     * @param {number|null} websiteInfo.number_of_employees - The current number of employees.
     * @param {number|null} websiteInfo.headcount_one_year_growth - The growth percentage from 12 months ago.
     * @param {number|null} websiteInfo.headcount_six_months_growth - The growth percentage from 6 months ago.
     * @param {number|null} websiteInfo.headcount_three_months_growth - The growth percentage from 3 months ago.
     * @returns {Object|null} An object with keys for "Now", "12m Ago", "6m Ago", and "3m Ago" if valid, or null if "Now" is missing.
     *
     */
    prepareHeadcountData(websiteInfo) {
      if (!websiteInfo || websiteInfo.number_of_employees === null) {
        return null; // No valid "Now" value, skip processing
      }

      const headcountData = {};

      try {
        if (websiteInfo.headcount_one_year_growth !== null) {
          headcountData['12m Ago'] = Math.round(
              calculatePastEmployees(
                  websiteInfo.number_of_employees,
                  websiteInfo.headcount_one_year_growth
              )
          );
        }
        if (websiteInfo.headcount_six_months_growth !== null) {
          headcountData['6m Ago'] = Math.round(
              calculatePastEmployees(
                  websiteInfo.number_of_employees,
                  websiteInfo.headcount_six_months_growth
              )
          );
        }
        if (websiteInfo.headcount_three_months_growth !== null) {
          headcountData['3m Ago'] = Math.round(
              calculatePastEmployees(
                  websiteInfo.number_of_employees,
                  websiteInfo.headcount_three_months_growth
              )
          );
        }
        headcountData.Now = websiteInfo.number_of_employees
      } catch (error) {
        console.error("Error calculating headcount data:", error.message);
      }

      return headcountData;
    },
    renderChart(renderData) {
      this.chartData = renderData;

      this.$nextTick(() => {
        const canvas = document.getElementById('employeesChart');
        if (!canvas) {
          console.error('Canvas element not found');
          return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Unable to get canvas context');
          return;
        }

        const renderLabels = Object.keys(renderData);
        const renderValues = Object.values(renderData);

        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: renderLabels,
            datasets: [
              {
                label: 'Employees',
                data: renderValues,
                backgroundColor: [
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                  'rgba(75, 192, 192, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
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
  text-align: center;
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

