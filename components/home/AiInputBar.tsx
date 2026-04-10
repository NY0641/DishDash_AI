import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Sparkles, ArrowUp } from 'lucide-react-native';
import { colors, spacing, radius, shadow } from '@/constants/theme';

interface AiInputBarProps {
  onSubmit: (text: string) => void;
}

export function AiInputBar({ onSubmit }: AiInputBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, shadow.md]}>
        <View style={styles.iconWrap}>
          <Sparkles color={colors.green.main} size={18} strokeWidth={2} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="What would you like to cook today?"
          placeholderTextColor={colors.text.muted}
          value={value}
          onChangeText={setValue}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          multiline={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, value.trim() ? styles.sendBtnActive : {}]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <ArrowUp
            color={value.trim() ? colors.text.inverse : colors.neutral[400]}
            size={16}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.md,
    marginTop: -24,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.green.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: colors.green.main,
  },
});
