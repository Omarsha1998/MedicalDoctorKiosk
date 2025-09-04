<template>
  <div class="login-page">
    <Loader :isLoading="loader" :login="true" />

    <q-card
      style="
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      "
      :class="[$q.screen.name + '-widthLogin', 'login-card']"
      @keyup.enter="submitLogin"
    >
      <div class="row justify-center">
        <div class="col-12 text-center">
          <div
            style="
              max-width: 175px;
              height: 175px;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <img
              src="../assets/images/PatientLogo-nobg.png"
              alt="Logo"
              style="max-width: 100%; max-height: 100%"
            />
          </div>
        </div>
        <div :class="$q.screen.lt.xs ? 'col-6' : 'col-12'">
          <div class="q-pa-md">
            <q-input
              class="q-mb-xs"
              v-model="secretaryCode"
              label="Secretary Code"
              label-color="blue-10"
              outlined
            />
            <q-input
              class="q-mb-xs"
              v-model="password"
              label="Password"
              label-color="blue-10"
              outlined
              :type="passwordVisible ? 'text' : 'password'"
            >
              <template v-slot:append>
                <q-icon
                  v-if="!passwordVisible"
                  name="visibility_off"
                  class="cursor-pointer"
                  color="black-10"
                  @click="passwordVisible = !passwordVisible"
                />
                <q-icon
                  v-else
                  name="visibility"
                  class="cursor-pointer"
                  color="black-10"
                  @click="passwordVisible = !passwordVisible"
                />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <q-checkbox
        class="q-pl-sm"
        v-model="rememberMe"
        label="Remember Me"
        color="blue-10"
      />

      <div class="q-pa-md" style="margin-top: auto">
        <q-btn
          class="full-width"
          color="blue-10"
          label="Login"
          type="submit"
          push
          @click="submitLogin"
        />
      </div>
    </q-card>
  </div>
</template>

<script>
import { Cookies } from "quasar";
import Loader from "../components/Loader.vue";

export default {
  data() {
    return {
      secretaryCode: "",
      password: "",
      loader: false,
      passwordVisible: false,
      rememberMe: false,
    };
  },

  components: {
    Loader,
  },

  created() {
    this.loadRememberedCredentials();
  },

  methods: {
    async submitLogin() {
      if (!this.secretaryCode || !this.password) {
        this.$q.notify({
          color: "negative",
          position: "center",
          message: "Input the Required Field",
          icon: "report_problem",
          timeout: 1000,
          progress: true,
        });
        return;
      }

      this.passwordVisible = false;
      this.loader = true;

      try {
        const data = {
          secretaryCode: this.secretaryCode,
          password: this.password,
        };

        await this.$store.dispatch("userModule/login", data);

        if (this.rememberMe) {
          Cookies.set("secretaryCode", this.secretaryCode, {
            expires: 7,
          });
          Cookies.set("password", this.password, { expires: 7 });
          Cookies.set("rememberMe", "true", { expires: 7 });
        } else {
          Cookies.remove("secretaryCode");
          Cookies.remove("password");
          Cookies.remove("rememberMe");
        }

        this.loader = false;
        this.$router.push("/doctor-attendance");
      } catch (error) {
        if (
          (error.response && error.response.status === 404) ||
          (error.response && error.response.status === 400)
        ) {
          this.$q.notify({
            color: "negative",
            position: "center",
            message: error.response.data.body,
            icon: "report_problem",
            timeout: 1000,
            progress: true,
          });
        }
        this.loader = false;
      }
    },

    // Load remembered credentials if "Remember Me" was checked
    loadRememberedCredentials() {
      if (Cookies.get("rememberMe") === "true") {
        this.secretaryCode = Cookies.get("secretaryCode") || "";
        this.password = Cookies.get("password") || "";
        this.rememberMe = true;
      }
    },
  },
};
</script>
