<template>
  <div class="profile-container">
    <div class="profile-card">
       <h2 class="section-title">我的資料</h2>
       <div class="profile-item">
          <span class="label">姓名：</span>
          <span>User</span>
       </div>
       <div class="profile-item">
          <span class="label">身分：</span>
          <span class="badge">租客</span>
       </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  padding-top: 20px;
}
.profile-card {
  width: 400px;
  background: #fffdf9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 14px rgba(46, 38, 34, 0.12);
}
</style>