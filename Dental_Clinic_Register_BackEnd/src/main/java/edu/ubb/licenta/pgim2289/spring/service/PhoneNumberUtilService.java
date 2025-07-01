package edu.ubb.licenta.pgim2289.spring.service;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import org.springframework.stereotype.Service;

@Service
public class PhoneNumberUtilService {

    private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

    /**
     * Validate phone number based on the region (country code).
     *
     * @param phoneNumber input phone number string (can be with + or without)
     * @param regionCode two-letter country code, e.g. "RO" for Romania
     * @return true if valid, false otherwise
     */
    public boolean isValidPhoneNumber(String phoneNumber, String regionCode) {
        try {
            Phonenumber.PhoneNumber numberProto = phoneUtil.parse(phoneNumber, regionCode);
            return phoneUtil.isValidNumber(numberProto);
        } catch (NumberParseException e) {
            return false;
        }
    }
}