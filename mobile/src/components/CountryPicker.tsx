import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../context/ThemeContext';
import { expiria } from '../theme';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia',
  'Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados',
  'Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina',
  'Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia',
  'Cameroon','Canada','Cape Verde','Central African Republic','Chad','Chile',
  'China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus',
  'Czech Republic','Denmark','Djibouti','Dominican Republic','Ecuador','Egypt',
  'El Salvador','Estonia','Ethiopia','Fiji','Finland','France','Gabon','Gambia',
  'Georgia','Germany','Ghana','Greece','Guatemala','Guinea','Guyana','Haiti',
  'Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait',
  'Kyrgyzstan','Laos','Latvia','Lebanon','Libya','Lithuania','Luxembourg',
  'Madagascar','Malaysia','Maldives','Mali','Malta','Mexico','Moldova','Monaco',
  'Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Macedonia',
  'Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Poland',
  'Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal',
  'Serbia','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea',
  'Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tajikistan',
  'Tanzania','Thailand','Togo','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States',
  'Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

interface CountryPickerProps {
  value: string;
  onChange: (country: string) => void;
}

export function CountryPicker({ value, onChange }: CountryPickerProps) {
  const colors = useThemeColors();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      search.trim()
        ? COUNTRIES.filter((c) =>
            c.toLowerCase().includes(search.toLowerCase()),
          )
        : COUNTRIES,
    [search],
  );

  const handleSelect = (country: string) => {
    onChange(country);
    setVisible(false);
    setSearch('');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, { borderBottomColor: colors.border }]}
        onPress={() => setVisible(true)}
        activeOpacity={0.6}
      >
        <Text
          style={[
            styles.triggerText,
            { color: value ? colors.primaryInk : colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {value || 'Select country'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.secondarySurface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.primaryInk }]}>
                Select Country
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={colors.primaryInk} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.primaryInk }]}
                placeholder="Search countries..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    item === value && { backgroundColor: colors.primarySurface + '30' },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.itemText, { color: colors.primaryInk }]}>
                    {item}
                  </Text>
                  {item === value && (
                    <Ionicons name="checkmark" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: colors.textMuted }]}>
                  No countries found
                </Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  triggerText: {
    fontSize: expiria.typography.sizes.body,
    fontWeight: expiria.typography.weights.regular,
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: expiria.borderRadius.lg,
    borderTopRightRadius: expiria.borderRadius.lg,
    maxHeight: '70%',
    paddingBottom: expiria.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: expiria.spacing.md,
    borderBottomWidth: expiria.strokes.thin,
  },
  title: {
    fontSize: expiria.typography.sizes.subheading,
    fontWeight: expiria.typography.weights.semibold,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: expiria.spacing.md,
    marginVertical: expiria.spacing.sm,
    paddingHorizontal: expiria.spacing.sm,
    gap: expiria.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: expiria.typography.sizes.body,
    paddingVertical: expiria.spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: expiria.spacing.sm + 4,
    paddingHorizontal: expiria.spacing.md,
  },
  itemText: {
    fontSize: expiria.typography.sizes.body,
  },
  empty: {
    textAlign: 'center',
    padding: expiria.spacing.lg,
    fontSize: expiria.typography.sizes.body,
  },
});
