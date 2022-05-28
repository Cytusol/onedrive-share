<template>
  <v-dialog v-model="dialog" persistent max-width="290">
    <template v-slot:activator="{ on, attrs }">
      <v-btn text v-bind="attrs" v-on="on" @click="getQRCode(value)">
        显示二维码
      </v-btn>
    </template>
    <v-card>
      <v-img :src="dataUrl">
      </v-img>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="dialog = false">
          关闭
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import * as QRCode from "qrcode"
export default {
  name: "QRCode",
  data: function() {
    return {
      dialog: false,
      dataUrl: ""
    }
  },
  props: {
    value: String
  },
  methods: {
    async getQRCode(str) {
      this.dataUrl = await QRCode.toDataURL(str);
    }
  },
  // mounted: function() {
  //   this.getQRCode(this.value)
  //   console.log(this.value)
  // }
};
</script>

<style>
</style>