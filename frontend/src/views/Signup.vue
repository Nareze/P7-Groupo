<template>
  <div>
    <div class="container">
      <form v-on:submit.prevent="submitForm">
        <h2>Merci de remplir tous les champs pour s'inscrire</h2>

        <label for="email"><b>Adresse Mail</b></label>
        <input
          type="text"
          placeholder="Entrer l'Email"
          name="email"
          required
          v-model="form.email"
          maxlength="50"
        />

        <label for="password"><b>Mot de passe</b></label>
        <input
          type="password"
          placeholder="Entrer le mot de passe"
          name="password"
          required
          v-model="form.password"
          maxlength="50"
        />

        <label for="username"><b>Nom d'utilisateur</b></label>
        <input
          type="text"
          placeholder="Entrer le nom d'utilisateur"
          name="username"
          required
          v-model="form.username"
          maxlength="25"
        />

        <label for="bio"><b>Description</b></label>
        <input
          type="text"
          placeholder="Présentez vous en quelque mots"
          name="bio"
          required
          v-model="form.bio"
          maxlength="25"
        />

        <div class="submitForm">
          <button type="submit" class="signupbtn">Je m'inscris</button>
        </div>
      </form>
    </div>

    <FooterItem />
  </div>
</template>

<script>
import axios from "axios";
import FooterItem from "../components/Footer.vue";

export default {
  name: "SignUp",
  components: {
    FooterItem,
  },

  data() {
    return {
      form: {
        email: "",
        username: "",
        password: "",
        bio: "",
      },
    };
  },

  methods: {
    submitForm() {
      axios
        .post("http://localhost:3000/api/user/signup", this.form)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          console.log(response);
          this.$router.push("/messageList");
        })
        .catch((error) => {
          alert(JSON.stringify(error.response.data)); // affichage des informations manquantes
        });
    },
  },
};
</script>

<style lang="scss">
.submitForm {
  margin-top: 35px;
}

@media screen and (max-width: 300px) {
}
</style>
