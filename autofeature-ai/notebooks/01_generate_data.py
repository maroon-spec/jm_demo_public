# Databricks notebook source
# MAGIC %md
# MAGIC # データ生成: AutoFeature AI デモ用
# MAGIC 与信審査デモ用のサンプルデータを生成

# COMMAND ----------

CATALOG = "classic_stable_nud6b0"
SCHEMA = "credit_scoring"

spark.sql(f"USE CATALOG {CATALOG}")
spark.sql(f"USE SCHEMA {SCHEMA}")

# COMMAND ----------

import dbldatagen as dg
from pyspark.sql import functions as F
from datetime import date

# COMMAND ----------

# MAGIC %md
# MAGIC ## 1. customers テーブル（10,000件）

# COMMAND ----------

customers_spec = (
    dg.DataGenerator(spark, name="customers", rows=10000, partitions=4)
    .withColumn("customer_id", "string", prefix="CUST", baseColumn="id")
    .withColumn("age", "int", minValue=20, maxValue=75, random=True)
    .withColumn("annual_income", "int", minValue=200, maxValue=3000, step=10, random=True)
    .withColumn("employment_type", "string", values=["正社員", "契約社員", "自営業", "パート", "役員"], weights=[50, 15, 15, 10, 10], random=True)
    .withColumn("years_employed", "int", minValue=0, maxValue=40, random=True)
    .withColumn("prefecture", "string", values=["東京都", "大阪府", "神奈川県", "愛知県", "福岡県", "北海道", "埼玉県", "千葉県", "兵庫県", "京都府", "その他"], weights=[25, 12, 10, 8, 6, 5, 7, 7, 5, 4, 11], random=True)
    .withColumn("num_dependents", "int", minValue=0, maxValue=5, random=True)
    .withColumn("has_mortgage", "boolean", values=[True, False], weights=[35, 65], random=True)
    .withColumn("registration_date", "date", begin="2018-01-01", end="2024-12-31", random=True)
)

df_customers = customers_spec.build()
# annual_income を万円単位に調整
df_customers = df_customers.withColumn("annual_income", F.col("annual_income") * 10000)
df_customers.write.mode("overwrite").saveAsTable(f"{CATALOG}.{SCHEMA}.customers")
print(f"customers: {df_customers.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 2. transactions テーブル（500,000件）

# COMMAND ----------

transactions_spec = (
    dg.DataGenerator(spark, name="transactions", rows=500000, partitions=8)
    .withColumn("txn_id", "string", prefix="TXN", baseColumn="id")
    .withColumn("customer_id_num", "int", minValue=0, maxValue=9999, random=True)
    .withColumn("amount", "double", minValue=100, maxValue=500000, random=True)
    .withColumn("merchant_category", "string", values=["食料品", "衣料品", "家電", "飲食店", "交通", "医療", "教育", "娯楽", "公共料金", "キャッシング"], weights=[20, 10, 8, 15, 10, 5, 5, 12, 10, 5], random=True)
    .withColumn("txn_type", "string", values=["purchase", "cash_advance", "online", "recurring"], weights=[50, 10, 30, 10], random=True)
    .withColumn("txn_date", "date", begin="2023-01-01", end="2025-03-31", random=True)
    .withColumn("is_international", "boolean", values=[True, False], weights=[8, 92], random=True)
)

df_txn = transactions_spec.build()
df_txn = df_txn.withColumn("customer_id", F.concat(F.lit("CUST"), F.lpad(F.col("customer_id_num").cast("string"), 10, "0"))).drop("customer_id_num")
df_txn = df_txn.withColumn("amount", F.round(F.col("amount"), 0))
df_txn.write.mode("overwrite").saveAsTable(f"{CATALOG}.{SCHEMA}.transactions")
print(f"transactions: {df_txn.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 3. payments テーブル（120,000件）

# COMMAND ----------

payments_spec = (
    dg.DataGenerator(spark, name="payments", rows=120000, partitions=4)
    .withColumn("payment_id", "string", prefix="PAY", baseColumn="id")
    .withColumn("customer_id_num", "int", minValue=0, maxValue=9999, random=True)
    .withColumn("due_amount", "double", minValue=5000, maxValue=500000, random=True)
    .withColumn("paid_amount_ratio", "double", minValue=0.0, maxValue=1.2, random=True)
    .withColumn("due_date", "date", begin="2023-01-01", end="2025-03-31", random=True)
    .withColumn("days_late", "int", minValue=-5, maxValue=90, random=True)
)

df_pay = payments_spec.build()
df_pay = (
    df_pay
    .withColumn("customer_id", F.concat(F.lit("CUST"), F.lpad(F.col("customer_id_num").cast("string"), 10, "0"))).drop("customer_id_num")
    .withColumn("due_amount", F.round(F.col("due_amount"), 0))
    .withColumn("paid_amount", F.round(F.col("due_amount") * F.col("paid_amount_ratio"), 0)).drop("paid_amount_ratio")
    .withColumn("days_late", F.when(F.col("days_late") < 0, 0).otherwise(F.col("days_late")))
    .withColumn("payment_date", F.date_add(F.col("due_date"), F.col("days_late").cast("int")))
)
df_pay.write.mode("overwrite").saveAsTable(f"{CATALOG}.{SCHEMA}.payments")
print(f"payments: {df_pay.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 4. credit_applications テーブル（10,000件）

# COMMAND ----------

applications_spec = (
    dg.DataGenerator(spark, name="credit_applications", rows=10000, partitions=4)
    .withColumn("app_id", "string", prefix="APP", baseColumn="id")
    .withColumn("customer_id_num", "int", minValue=0, maxValue=9999, random=True)
    .withColumn("requested_limit", "int", values=[100000, 300000, 500000, 1000000, 2000000, 5000000], weights=[15, 25, 25, 20, 10, 5], random=True)
    .withColumn("credit_score", "int", minValue=300, maxValue=850, random=True)
    .withColumn("approved", "boolean", values=[True, False], weights=[65, 35], random=True)
    .withColumn("app_date", "date", begin="2023-01-01", end="2025-03-31", random=True)
    .withColumn("channel", "string", values=["web", "branch", "phone", "partner"], weights=[45, 25, 15, 15], random=True)
)

df_app = applications_spec.build()
df_app = df_app.withColumn("customer_id", F.concat(F.lit("CUST"), F.lpad(F.col("customer_id_num").cast("string"), 10, "0"))).drop("customer_id_num")
# credit_scoreが低い場合はapprovedをFalseに寄せる
df_app = df_app.withColumn(
    "approved",
    F.when(F.col("credit_score") < 500, F.lit(False))
     .when(F.col("credit_score") > 700, F.lit(True))
     .otherwise(F.col("approved"))
)
df_app.write.mode("overwrite").saveAsTable(f"{CATALOG}.{SCHEMA}.credit_applications")
print(f"credit_applications: {df_app.count()} rows")

# COMMAND ----------

# MAGIC %md
# MAGIC ## 確認

# COMMAND ----------

for table in ["customers", "transactions", "payments", "credit_applications"]:
    count = spark.table(f"{CATALOG}.{SCHEMA}.{table}").count()
    print(f"{table}: {count} rows")
