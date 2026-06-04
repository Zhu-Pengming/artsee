import 'package:flutter/material.dart';
import '../../theme/artsee_ui_colors.dart';

class EmojiPicker extends StatelessWidget {
  final ValueChanged<String> onEmojiTap;

  const EmojiPicker({
    super.key,
    required this.onEmojiTap,
  });

  static const List<String> _emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
    '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
    '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠',
    '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️',
    '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨',
    '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
    '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘',
    '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 240,
      decoration: BoxDecoration(
        color: context.artC.porcelain.withValues(alpha: 0.98),
        border: Border(
          top: BorderSide(color: context.artC.silver.withValues(alpha: 0.5)),
        ),
      ),
      child: GridView.builder(
        padding: const EdgeInsets.all(12),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 8,
          crossAxisSpacing: 8,
          mainAxisSpacing: 8,
          childAspectRatio: 1,
        ),
        itemCount: _emojis.length,
        itemBuilder: (context, index) {
          final emoji = _emojis[index];
          return GestureDetector(
            onTap: () => onEmojiTap(emoji),
            child: Container(
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: context.artC.silver.withValues(alpha: 0.3),
                ),
              ),
              child: Text(
                emoji,
                style: const TextStyle(fontSize: 24),
              ),
            ),
          );
        },
      ),
    );
  }
}
