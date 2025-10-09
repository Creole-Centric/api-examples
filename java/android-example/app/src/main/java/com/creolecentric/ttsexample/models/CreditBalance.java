package com.creolecentric.ttsexample.models;

import com.google.gson.annotations.SerializedName;

public class CreditBalance {
    @SerializedName("total_credits")
    private int totalCredits;

    @SerializedName("subscription_credits")
    private int subscriptionCredits;

    @SerializedName("purchased_credits")
    private int purchasedCredits;

    // Getters
    public int getTotalCredits() { return totalCredits; }
    public int getSubscriptionCredits() { return subscriptionCredits; }
    public int getPurchasedCredits() { return purchasedCredits; }

    // Setters
    public void setTotalCredits(int totalCredits) { this.totalCredits = totalCredits; }
    public void setSubscriptionCredits(int subscriptionCredits) { this.subscriptionCredits = subscriptionCredits; }
    public void setPurchasedCredits(int purchasedCredits) { this.purchasedCredits = purchasedCredits; }
}
